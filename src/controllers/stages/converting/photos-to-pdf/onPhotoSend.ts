import bot from '@bot'
import logger from '@services/Logger'
import { Stages } from '@interfaces/Stages'
import { BOT_TEXTS } from '@constants/texts'
import { LogLevels } from '@interfaces/Logger'
import { Message } from 'node-telegram-bot-api'
import stageManager from '@services/StageManager'
import { isIncorrectMimeType } from '@utils/photosToPdf'
import { MAX_FILE_SUMMARY_SIZE } from '@constants/photosToPdf'
import { PhotosToPdfConvertingInfo } from '@interfaces/PhotosToPdf'
import { showSizeLimitExceededMessage, showUnknownPhotoSizeMessage } from '@controllers/menus/converting/photos-to-pdf'

// if user send photo as photo
bot.on('photo', async (msg: Message) => {
    try {
        if (
            msg.from &&
            msg.photo &&
            msg.photo.length > 0 &&
            stageManager.isUserInStage(msg.from.id, Stages.PHOTOS_TO_PDF)
        ) {
            const processTime = new Date()

            const userStageData: PhotosToPdfConvertingInfo | undefined = stageManager.getUserStageData(msg.from.id)

            if (!userStageData) {
                return
            }

            // take last photo because it has better quality
            const lastPhoto = msg.photo[msg.photo.length - 1]

            const summarySize: number | null = userStageData.filesSummarySize

            // check if we have info about file size
            if (lastPhoto.file_size) {
                // check if next photo will not exceed the limit
                if (summarySize + lastPhoto.file_size < MAX_FILE_SUMMARY_SIZE) {
                    // add photo id and increase summary file size
                    userStageData.files.push({
                        fileId: lastPhoto.file_id,
                        fileSentTime: new Date(),
                    })
                    userStageData.filesSummarySize = summarySize + lastPhoto.file_size
                    stageManager.setStageForUser(msg.from.id, Stages.PHOTOS_TO_PDF, userStageData)
                } else if (!userStageData.sizeLimitMessageWasShown) {
                    await showSizeLimitExceededMessage(msg.from.id)
                    userStageData.sizeLimitMessageWasShown = true
                    stageManager.setStageForUser(msg.from.id, Stages.PHOTOS_TO_PDF, userStageData)
                }
            } else {
                await showUnknownPhotoSizeMessage(msg.from.id)
            }

            logger.log(
                LogLevels.INFO,
                `User send photo as photo in '${Stages.PHOTOS_TO_PDF}' menu`,
                `USER: ${JSON.stringify(msg.from, null, 4)}`,
                processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
            )
        }
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            `User send photo as photo in '${Stages.PHOTOS_TO_PDF}' menu`,
            `USER: ${JSON.stringify(msg.from, null, 4)}\nERROR: ${JSON.stringify(err, null, 4)}`,
            0,
        )
    }
})

// if user sent photo as file
bot.on('document', async (msg: Message) => {
    try {
        if (msg.from && msg.document && stageManager.isUserInStage(msg.from.id, Stages.PHOTOS_TO_PDF)) {
            const processTime = new Date()
            const userStageData: PhotosToPdfConvertingInfo | undefined = stageManager.getUserStageData(msg.from.id)

            if (!userStageData) {
                return
            }

            if (isIncorrectMimeType(msg.document.mime_type)) {
                await bot.sendMessage(msg.from.id, BOT_TEXTS.ONLY_CONCRETE_TYPES_OF_FILES_APPLIES_MESSAGE)
                logger.log(
                    LogLevels.WARN,
                    `Incorrect photo as file in '${Stages.PHOTOS_TO_PDF}' menu`,
                    `USER: ${JSON.stringify(msg.from, null, 4)}\nMime type: ${msg.document.mime_type}`,
                    processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
                )
                return
            }

            const summarySize: number | null = userStageData.filesSummarySize

            // check if we have info about file size
            if (msg.document.file_size) {
                // check if next photo will not exceed the limit
                if (summarySize + msg.document.file_size < MAX_FILE_SUMMARY_SIZE) {
                    // add photo id and increase summary file size
                    userStageData.files.push({
                        fileId: msg.document.file_id,
                        fileMimeType: msg.document.mime_type,
                        fileSentTime: new Date(),
                    })
                    userStageData.filesSummarySize = summarySize + msg.document.file_size
                    stageManager.setStageForUser(msg.from.id, Stages.PHOTOS_TO_PDF, userStageData)
                } else if (!userStageData.sizeLimitMessageWasShown) {
                    await showSizeLimitExceededMessage(msg.from.id)
                    userStageData.sizeLimitMessageWasShown = true
                    stageManager.setStageForUser(msg.from.id, Stages.PHOTOS_TO_PDF, userStageData)
                }
            } else {
                await showUnknownPhotoSizeMessage(msg.from.id)
            }

            logger.log(
                LogLevels.INFO,
                `User send photo as file in '${Stages.PHOTOS_TO_PDF}' menu`,
                `USER: ${JSON.stringify(msg.from, null, 4)}`,
                processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
            )
        }
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            `User send photo as file in '${Stages.PHOTOS_TO_PDF}' menu`,
            `USER: ${JSON.stringify(msg.from, null, 4)}\nERROR: ${JSON.stringify(err, null, 4)}`,
            0,
        )
    }
})
