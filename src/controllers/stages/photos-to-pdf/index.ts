import bot from '@bot'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import { getConvertMenu } from '@controllers/menus/photos-to-pdf'
import { ConvertingInfo } from '@interfaces/PhotosToPdf'
import { findOrCreateUser, getUserFilesDirectory, mapUser } from '@utils/users'
import {
    getUserSentFiles,
    getUserSentOutputFileName,
    downloadPhotosToPdf,
    getIsConvertingInProcess,
    matchPhotoSizeToPdf,
} from '@utils/photosToPdf'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import { getPhotoSize } from '@utils/photos'
import path from 'path'
import { isEntitiesIncludeSomeStage } from '@utils/stages'
import sanitize from 'sanitize-filename'

let userFiles: ConvertingInfo[] = []

function setFileNameForUser(userId: number, newFileName: string) {
    for (let index = 0; index < userFiles.length; index++) {
        if (userFiles[index].userId === userId) {
            userFiles[index].outputFileName = newFileName
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

function removeUserFromList(userId: number): void {
    userFiles = userFiles.filter((item) => item.userId !== userId)
}

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
                outputFileName: callback.from.first_name,
                isConvertingInProcess: false,
            })
        }

        await bot.sendMessage(
            callback.from.id,
            '‼ Принимаются только фото без сжатия ‼\n' +
                '‼ Имя исходного файла можно отправить сообщением ‼\n' +
                'После загрузки фотографий нажмите "Конвертировать"',
            {
                reply_markup: {
                    keyboard: getConvertMenu(),
                    resize_keyboard: true,
                },
            },
        )

        await bot.answerCallbackQuery(callback.id)
    } catch (err) {
        console.log(err)
    }
})

// if user sent photo
bot.on('document', async (msg: Message) => {
    try {
        if (msg.from && msg.document) {
            await findOrCreateUser(mapUser(msg.from))

            if (!msg.document || (msg.document.mime_type !== 'image/jpeg' && msg.document.mime_type !== 'image/png')) {
                await bot.sendMessage(msg.from.id, '‼ Проверьте корректность загружаемого файла ‼')
                return
            }

            const files: string[] | null = getUserSentFiles(userFiles, msg.from.id)

            if (files) {
                files.push(msg.document.file_id)
            }
        }
    } catch (err) {
        console.log(err)
    }
})

// if user change stage to another
bot.on('message', async (msg: Message) => {
    if (msg.from && msg.text && msg.entities && isEntitiesIncludeSomeStage(msg.entities, msg.text)) {
        removeUserFromList(msg.from.id)
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

        // set up first page and first photo in document
        const defaultMargins = { top: 0, left: 0, bottom: 0, right: 0 }
        const doc = new PDFDocument({ autoFirstPage: false })
        const writeStream = fs.createWriteStream(outputFilePath)
        doc.pipe(writeStream)

        // set up other pages in document
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
                await bot.sendDocument(userId, fs.createReadStream(outputFilePath))
                await bot.deleteMessage(userId, String(convertingMessage.message_id))
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
