import bot from '@bot'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import {
    showPhotosToPdfConvertMenu,
    showSizeLimitExceededMessage,
    showUnknownPhotoSizeMessage,
} from '@controllers/menus/photos-to-pdf'
import { PhotosToPdfConvertingInfo } from '@interfaces/PhotosToPdf'
import { findOrCreateUser, getUserFilesDirectory, mapUser } from '@utils/users'
import {
    getUserSentFiles,
    getUserSentOutputFileName,
    downloadPhotosToPdf,
    getIsConvertingInProcess,
    matchPhotoSizeToPdf,
    getUserFilesSummarySizeInfo,
    getUserSizeLimitMessageState,
} from '@utils/photosToPdf'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import { getPhotoSize } from '@utils/photos'
import path from 'path'
import { isEntitiesIncludeSomeStage } from '@utils/stages'
import sanitize from 'sanitize-filename'
import { showStartMenu } from '@controllers/menus/start'
import { MAX_FILE_SUMMARY_SIZE } from '@constants/photosToPdf'

let userFiles: PhotosToPdfConvertingInfo[] = []

// show user converting from photos to pdf menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== 'photos-to-pdf') return
        await findOrCreateUser(mapUser(callback.from))

        const files: string[] | null = getUserSentFiles(userFiles, callback.from.id)
        if (!files) {
            userFiles.push({
                userId: callback.from.id,
                fileIds: [],
                filesSummarySize: 0,
                sizeLimitMessageWasShown: false,
                outputFileName: sanitize(callback.from.first_name) || 'filename',
                isConvertingInProcess: false,
            })
        }

        await showPhotosToPdfConvertMenu(callback.from.id)

        await bot.answerCallbackQuery(callback.id)
    } catch (err) {
        console.log(err)
    }
})

// if user send photo as photo
bot.on('photo', async (msg: Message) => {
    try {
        if (msg.from && msg.photo && msg.photo.length > 0) {
            const files: string[] | null = getUserSentFiles(userFiles, msg.from.id)

            if (!files) {
                return
            }

            // take last photo because it has better quality
            const lastPhoto = msg.photo[msg.photo.length - 1]

            const summarySize: number | null = getUserFilesSummarySizeInfo(userFiles, msg.from.id)

            // check if we have info about file size
            if (summarySize !== null && lastPhoto.file_size) {
                // check if next photo will not exceed the limit
                if (summarySize + lastPhoto.file_size < MAX_FILE_SUMMARY_SIZE) {
                    // add photo id and increase summary file size
                    files.push(lastPhoto.file_id)
                    setFileSummarySizeForUser(msg.from.id, summarySize + lastPhoto.file_size)
                } else if (!getUserSizeLimitMessageState(userFiles, msg.from.id)) {
                    await showSizeLimitExceededMessage(msg.from.id)
                    setSizeLimitShownMessageState(msg.from.id, true)
                }
            } else {
                await showUnknownPhotoSizeMessage(msg.from.id)
            }
        }
    } catch (err) {
        console.log(err)
    }
})

// if user sent photo as file
bot.on('document', async (msg: Message) => {
    try {
        if (msg.from && msg.document) {
            const files: string[] | null = getUserSentFiles(userFiles, msg.from.id)

            if (!files) {
                return
            }

            // check file types (only .jpg and .png available)
            if (msg.document.mime_type !== 'image/jpeg' && msg.document.mime_type !== 'image/png') {
                await bot.sendMessage(msg.from.id, '‼ Принимаются только файлы типа .jpg и .png')
                return
            }

            const summarySize: number | null = getUserFilesSummarySizeInfo(userFiles, msg.from.id)
            // check if we have info about file size
            if (summarySize !== null && msg.document.file_size) {
                // check if next photo will not exceed the limit
                if (summarySize + msg.document.file_size < MAX_FILE_SUMMARY_SIZE) {
                    // add photo id and increase summary file size
                    files.push(msg.document.file_id)
                    setFileSummarySizeForUser(msg.from.id, summarySize + msg.document.file_size)
                } else if (!getUserSizeLimitMessageState(userFiles, msg.from.id)) {
                    await showSizeLimitExceededMessage(msg.from.id)
                    setSizeLimitShownMessageState(msg.from.id, true)
                }
            } else {
                await showUnknownPhotoSizeMessage(msg.from.id)
            }
        }
    } catch (err) {
        console.log(err)
    }
})

// if user change stage to another
bot.on('message', async (msg: Message) => {
    try {
        if (msg.from && msg.text && msg.entities && isEntitiesIncludeSomeStage(msg.entities, msg.text)) {
            await findOrCreateUser(mapUser(msg.from))
            removeUserFromList(msg.from.id)
        }
    } catch (err) {
        console.log(err)
    }
})

// if user sent new output file name
bot.on('message', async (msg: Message) => {
    try {
        if (msg.from && msg.text && msg.text.length < 250 && !msg.entities && msg.text !== 'Конвертировать') {
            await findOrCreateUser(mapUser(msg.from))

            const oldFileName = getUserSentOutputFileName(userFiles, msg.from.id)

            if (oldFileName) {
                // find user and change file name for him
                const sanitizedFileName: string = sanitize(msg.text)

                if (sanitizedFileName) {
                    setFileNameForUser(msg.from.id, sanitizedFileName)

                    await bot.sendMessage(
                        msg.from.id,
                        'Имя исходного файла было успешно заменено ✅\n' +
                            'Новое имя файла: ' +
                            '<b>' +
                            sanitizedFileName +
                            '</b>',
                        {
                            parse_mode: 'HTML',
                        },
                    )
                }
            }
        }
    } catch (err) {
        console.log(err)
    }
})

// if user click on "CONVERT" button
bot.on('message', async (msg: Message) => {
    try {
        if (msg.text !== 'Конвертировать' || !msg.from) return
        const userId = msg.from.id
        await findOrCreateUser(mapUser(msg.from))

        const files: string[] | null = getUserSentFiles(userFiles, userId)
        // check if user want to convert files
        if (!files) {
            return
        }

        // check if user sent at least one file
        if (files && !files.length) {
            await bot.sendMessage(userId, '‼ Нужно отправить как минимум 1 файл ‼')
            return
        }

        // check if the converting is already launch
        if (getIsConvertingInProcess(userFiles, userId)) {
            return
        }

        setConvertingStateForUser(userId, true)
        const convertingMessage: Message = await bot.sendMessage(userId, 'В процессе конвертации...', {
            reply_markup: { remove_keyboard: true },
        })

        const dirPath: string = getUserFilesDirectory(msg.from)
        const outputFileName: string = getUserSentOutputFileName(userFiles, userId) + '.pdf'
        const outputFilePath: string = path.join(dirPath, outputFileName)
        const downloadedFilesPath: string[] = await downloadPhotosToPdf(files, dirPath)

        // set up document
        const defaultMargins = { top: 0, left: 0, bottom: 0, right: 0 }
        const doc = new PDFDocument({ autoFirstPage: false })
        const writeStream = fs.createWriteStream(outputFilePath)
        doc.pipe(writeStream)

        // set up pages to document
        for (let index = 0; index < downloadedFilesPath.length; index++) {
            const photoSize = await getPhotoSize(downloadedFilesPath[index])
            const matchedPhotoSize = matchPhotoSizeToPdf(photoSize)

            doc.addPage({ margins: defaultMargins, size: [matchedPhotoSize.width, matchedPhotoSize.height] })
            doc.image(downloadedFilesPath[index], {
                width: matchedPhotoSize.width,
                height: matchedPhotoSize.height,
            })
        }

        doc.end()
        writeStream.on('finish', async () => {
            try {
                await bot.sendChatAction(userId, 'upload_document')
                await bot.sendDocument(
                    userId,
                    fs.readFileSync(outputFilePath),
                    {},
                    {
                        filename: outputFileName,
                        contentType: 'application/pdf',
                    },
                )
                await bot.deleteMessage(userId, String(convertingMessage.message_id))
                await showStartMenu(userId)
            } catch (err) {
                console.log(err)
            }

            removeUserFromList(userId)
            fs.unlinkSync(outputFilePath)
            downloadedFilesPath.forEach((path: string) => {
                fs.unlinkSync(path)
            })
        })

        writeStream.on('error', async (err) => {
            console.log(err)
        })
    } catch (err) {
        console.log(err)
    }
})

function setFileNameForUser(userId: number, newFileName: string) {
    for (let index = 0; index < userFiles.length; index++) {
        if (userFiles[index].userId === userId) {
            userFiles[index].outputFileName = newFileName
            break
        }
    }
}

function setSizeLimitShownMessageState(userId: number, newLimitState: boolean) {
    for (let index = 0; index < userFiles.length; index++) {
        if (userFiles[index].userId === userId) {
            userFiles[index].sizeLimitMessageWasShown = newLimitState
            break
        }
    }
}

function setConvertingStateForUser(userId: number, newConvertingState: boolean) {
    for (let index = 0; index < userFiles.length; index++) {
        if (userFiles[index].userId === userId) {
            userFiles[index].isConvertingInProcess = newConvertingState
            break
        }
    }
}

function setFileSummarySizeForUser(userId: number, newFilesSummarySize: number) {
    for (let index = 0; index < userFiles.length; index++) {
        if (userFiles[index].userId === userId) {
            userFiles[index].filesSummarySize = newFilesSummarySize
            break
        }
    }
}

function removeUserFromList(userId: number): void {
    userFiles = userFiles.filter((item) => item.userId !== userId)
}
