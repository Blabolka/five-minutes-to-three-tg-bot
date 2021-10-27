import fs from 'fs'
import bot from '@bot'
import path from 'path'
import PDFDocument from 'pdfkit'
import { getPhotoSize } from '@utils/photos'
import { Message } from 'node-telegram-bot-api'
import stageManager from '@services/StageManager'
import { showStartMenu } from '@controllers/menus/start'
import { PhotosToPdfConvertingInfo } from '@interfaces/PhotosToPdf'
import { downloadPhotosToPdf, matchPhotoSizeToPdf } from '@utils/photosToPdf'
import { findOrCreateUser, getUserFilesDirectory, mapUser } from '@utils/users'

// if user click on "CONVERT" button
bot.on('message', async (msg: Message) => {
    try {
        if (msg.text !== 'Конвертировать' || !msg.from || !stageManager.isUserInStage(msg.from.id, 'photos-to-pdf')) {
            return
        }

        const userId = msg.from.id

        await findOrCreateUser(mapUser(msg.from))
        const userStageData: PhotosToPdfConvertingInfo | undefined = stageManager.getUserStageData(userId)

        // check if user sent at least one file
        if (!userStageData || !userStageData.fileIds.length) {
            await bot.sendMessage(userId, '‼ Нужно отправить как минимум 1 файл ‼')
            return
        }

        // check if the converting is already launch
        if (userStageData.isConvertingInProcess) {
            return
        }

        userStageData.isConvertingInProcess = true
        stageManager.setStageForUser(userId, 'photos-to-pdf', userStageData)

        const convertingMessage: Message = await bot.sendMessage(userId, 'В процессе конвертации...', {
            reply_markup: { remove_keyboard: true },
        })

        const dirPath: string = getUserFilesDirectory(msg.from)
        const outputFileName: string = userStageData.outputFileName + '.pdf'
        const outputFilePath: string = path.join(dirPath, outputFileName)
        const downloadedFilesPath: string[] = await downloadPhotosToPdf(userStageData.fileIds, dirPath)

        // set up document
        const defaultMargins = { top: 0, left: 0, bottom: 0, right: 0 }
        const doc = new PDFDocument({ autoFirstPage: false })
        const writeStream = fs.createWriteStream(outputFilePath)
        doc.pipe(writeStream)

        // set up pages to document
        for (const path of downloadedFilesPath) {
            const photoSize = await getPhotoSize(path)
            const matchedPhotoSize = matchPhotoSizeToPdf(photoSize)

            doc.addPage({ margins: defaultMargins, size: [matchedPhotoSize.width, matchedPhotoSize.height] })
            doc.image(path, {
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
                stageManager.setStageForUser(userId, 'start')
            } catch (err) {
                console.log(err)
            }

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
