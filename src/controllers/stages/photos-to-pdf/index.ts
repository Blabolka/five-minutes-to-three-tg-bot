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
} from '@utils/photosToPdf'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import { getPhotoSize } from '@utils/photos'
import path from 'path'
import { isEntitiesIncludeSomeStage } from '@utils/stages'

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
                setFileNameForUser(msg.from.id, msg.text)

                await bot.sendMessage(msg.from.id, 'Имя исходного файла было успешно заменено ✅')
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
        await bot.sendMessage(userId, 'Процесс конвертации начался...', {
            reply_markup: { remove_keyboard: true },
        })

        const dirPath: string = getUserFilesDirectory(msg.from)
        const outputFileName: string = getUserSentOutputFileName(userFiles, userId) + '.pdf'
        const outputFilePath: string = path.join(dirPath, outputFileName)
        const downloadedFilesPath: string[] = await downloadPhotosToPdf(files, dirPath)

        // set up first page and first photo in document
        const defaultMargins = { top: 0, left: 0, bottom: 0, right: 0 }
        const firstPhotoSize = await getPhotoSize(downloadedFilesPath[0])
        const doc = new PDFDocument({ margins: defaultMargins, size: [firstPhotoSize.width, firstPhotoSize.height] })
        const writeStream = fs.createWriteStream(outputFilePath)
        doc.pipe(writeStream)
        doc.image(downloadedFilesPath[0])

        // set up other pages in document
        for (let index = 1; index < downloadedFilesPath.length; index++) {
            const photoSize = await getPhotoSize(downloadedFilesPath[index])
            doc.addPage({ margins: defaultMargins, size: [photoSize.width, photoSize.height] })
            doc.image(downloadedFilesPath[index])
        }

        doc.end()
        writeStream.on('finish', async () => {
            await bot.sendChatAction(userId, 'upload_document')
            await bot.sendDocument(userId, fs.createReadStream(outputFilePath))

            removeUserFromList(userId)
            fs.unlinkSync(outputFilePath)
            downloadedFilesPath.forEach((path: string) => {
                fs.unlinkSync(path)
            })
        })
    } catch (err) {
        console.log(err)
    }
})
