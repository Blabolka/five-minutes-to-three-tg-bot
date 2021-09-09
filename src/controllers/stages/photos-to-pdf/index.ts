import bot from '@bot'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import { getConvertMenu } from '@controllers/menus/photos-to-pdf'
import { UserFiles } from '@interfaces/UserFiles'
import {
    findOrCreateUser,
    getUserFilesDirectory,
    getUserSentFiles,
    getUserSentOutputFileName,
    mapUser,
} from '@utils/users'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import { downloadPhotosToPdf } from '@utils/files'
import { getPhotoSize } from '@utils/photos'
import path from 'path'

let userFiles: UserFiles[] = []

bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== 'photos-to-pdf') return
        await findOrCreateUser(mapUser(callback.from))

        const files: string[] | null = getUserSentFiles(userFiles, callback.from.id)
        if (!files) {
            userFiles.push({ userId: callback.from.id, fileIds: [], outputFileName: callback.from.first_name })
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

// if user sent new output file name
bot.on('message', async (msg: Message) => {
    try {
        if (msg.from && msg.text && msg.text.length < 250 && msg.text !== 'Конвертировать') {
            await findOrCreateUser(mapUser(msg.from))

            const oldFileName = getUserSentOutputFileName(userFiles, msg.from.id)

            if (oldFileName) {
                // find user and change file name for him
                for (let index = 0; index < userFiles.length; index++) {
                    if (userFiles[index].userId === msg.from.id) {
                        userFiles[index].outputFileName = msg.text
                        break
                    }
                }

                await bot.sendMessage(msg.from.id, 'Имя исходного файла было успешно заменено ✅')
            }
        }
    } catch (err) {
        console.log(err)
    }
})

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

        // TODO fix double converting if user fast click on 'Конвертировать' button
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

            // delete files after complete converting and sending it to users
            userFiles = userFiles.filter((item) => item.userId !== userId)
            fs.unlinkSync(outputFilePath)
            downloadedFilesPath.forEach((path: string) => {
                fs.unlinkSync(path)
            })
        })
    } catch (err) {
        console.log(err)
    }
})
