import fs from 'fs'
import bot from '@bot'
import path from 'path'
import PDFDocument from 'pdfkit'
import logger from '@services/Logger'
import { Stages } from '@interfaces/Stages'
import { BOT_TEXTS } from '@constants/texts'
import { getPhotoSize } from '@utils/photos'
import { LogLevels } from '@interfaces/Logger'
import stageManager from '@services/StageManager'
import { Message, User } from 'node-telegram-bot-api'
import { showStartMenu } from '@controllers/menus/start'
import { downloadPhotosToPdf, matchPhotoSizeToPdf } from '@utils/photosToPdf'
import { findOrCreateUser, getUserFilesDirectory, mapUser } from '@utils/users'
import { PhotosToPdfFileInfo, PhotosToPdfConvertingInfo } from '@interfaces/PhotosToPdf'

// if user click on "CONVERT" button
bot.on('message', async (msg: Message) => {
    try {
        if (
            msg.text !== BOT_TEXTS.BOTTOM_MENU_CONVERT ||
            !msg.from ||
            !stageManager.isUserInStage(msg.from.id, Stages.PHOTOS_TO_PDF)
        ) {
            return
        }
        const processTime = new Date()

        const userFrom = msg.from
        const userId = msg.from.id

        await findOrCreateUser(mapUser(msg.from))
        const userStageData: PhotosToPdfConvertingInfo | undefined = stageManager.getUserStageData(userId)

        // check if user sent at least one file
        if (!userStageData || !userStageData.files.length) {
            await bot.sendMessage(userId, BOT_TEXTS.AT_LEAST_ONE_FILE_REQUIRED_MESSAGE)
            return
        }

        // check if the converting is already launch
        if (userStageData.isConvertingInProcess) {
            return
        }

        userStageData.isConvertingInProcess = true
        stageManager.setStageForUser(userId, Stages.PHOTOS_TO_PDF, userStageData)

        const convertingMessage: Message = await bot.sendMessage(userId, BOT_TEXTS.IN_CONVERT_PROCESS, {
            reply_markup: { remove_keyboard: true },
        })

        const dirPath: string = getUserFilesDirectory(msg.from)
        const outputFileName: string = userStageData.outputFileName + '.pdf'
        const outputFilePath: string = path.join(dirPath, outputFileName)
        const downloadedFilesPath: string[] = await downloadPhotosToPdf(userStageData.files, dirPath, {
            onDownloadFileError: (file: PhotosToPdfFileInfo, error) => {
                onDownloadFileError(file, error, userFrom)
            },
        })

        if (!downloadedFilesPath.length) {
            await bot.sendMessage(userId, BOT_TEXTS.CONVERT_FAILED_MESSAGE)
            await showStartMenu(userId)
            stageManager.setStageForUser(userId, Stages.START)
            return
        }

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

                logger.log(
                    LogLevels.INFO,
                    `Send document in '${Stages.PHOTOS_TO_PDF}' menu`,
                    `USER: ${JSON.stringify(msg.from, null, 4)}\nSTAGE_DATA: ${JSON.stringify(userStageData, null, 4)}`,
                    processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
                )

                await showStartMenu(userId)
                stageManager.setStageForUser(userId, Stages.START)
            } catch (err) {
                logger.log(
                    LogLevels.ERROR,
                    `Send document in '${Stages.PHOTOS_TO_PDF}' menu`,
                    `USER: ${JSON.stringify(msg.from, null, 4)}\nSTAGE_DATA: ${JSON.stringify(
                        userStageData,
                        null,
                        4,
                    )}\nERROR: ${JSON.stringify(err, null, 4)}`,
                    processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
                )
            }

            fs.unlinkSync(outputFilePath)
            downloadedFilesPath.forEach((path: string) => {
                fs.unlinkSync(path)
            })
        })

        writeStream.on('error', async (err) => {
            logger.log(
                LogLevels.ERROR,
                'Converting photos-to-pdf',
                `USER: ${JSON.stringify(msg.from, null, 4)}\nSTAGE_DATA: ${JSON.stringify(
                    userStageData,
                    null,
                    4,
                )}\nERROR: ${JSON.stringify(err, null, 4)}`,
                processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
            )
        })
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            'Converting photos-to-pdf',
            `USER: ${JSON.stringify(msg.from, null, 4)}\nERROR: ${JSON.stringify(err, null, 4)}`,
            0,
        )
    }
})

const onDownloadFileError = (file: PhotosToPdfFileInfo, err, user: User) => {
    logger.log(
        LogLevels.ERROR,
        'Downloading file error in photos-to-pdf',
        `USER: ${JSON.stringify(user, null, 4)}\nERROR: ${JSON.stringify(err, null, 4)}\nFile info: ${JSON.stringify(
            file,
            null,
            4,
        )}`,
        0,
    )
}
