import bot from '@bot'
import { Message } from 'node-telegram-bot-api'
import stageManager from '@services/StageManager'
import { MAX_FILE_SUMMARY_SIZE } from '@constants/photosToPdf'
import { PhotosToPdfConvertingInfo } from '@interfaces/PhotosToPdf'
import { showSizeLimitExceededMessage, showUnknownPhotoSizeMessage } from '@controllers/menus/photos-to-pdf'

// if user send photo as photo
bot.on('photo', async (msg: Message) => {
    try {
        if (msg.from && msg.photo && msg.photo.length > 0 && stageManager.isUserInStage(msg.from.id, 'photos-to-pdf')) {
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
                    userStageData.fileIds.push(lastPhoto.file_id)
                    userStageData.filesSummarySize = summarySize + lastPhoto.file_size
                    stageManager.setStageForUser(msg.from.id, 'photos-to-pdf', userStageData)
                } else if (!userStageData.sizeLimitMessageWasShown) {
                    await showSizeLimitExceededMessage(msg.from.id)
                    userStageData.sizeLimitMessageWasShown = true
                    stageManager.setStageForUser(msg.from.id, 'photos-to-pdf', userStageData)
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
            const userStageData: PhotosToPdfConvertingInfo | undefined = stageManager.getUserStageData(msg.from.id)

            if (!userStageData) {
                return
            }

            // check file types (only .jpg and .png available)
            if (msg.document.mime_type !== 'image/jpeg' && msg.document.mime_type !== 'image/png') {
                await bot.sendMessage(msg.from.id, '‼ Принимаются только файлы типа .jpg и .png')
                return
            }

            const summarySize: number | null = userStageData.filesSummarySize

            // check if we have info about file size
            if (msg.document.file_size) {
                // check if next photo will not exceed the limit
                if (summarySize + msg.document.file_size < MAX_FILE_SUMMARY_SIZE) {
                    // add photo id and increase summary file size
                    userStageData.fileIds.push(msg.document.file_id)
                    userStageData.filesSummarySize = summarySize + msg.document.file_size
                    stageManager.setStageForUser(msg.from.id, 'photos-to-pdf', userStageData)
                } else if (!userStageData.sizeLimitMessageWasShown) {
                    await showSizeLimitExceededMessage(msg.from.id)
                    userStageData.sizeLimitMessageWasShown = true
                    stageManager.setStageForUser(msg.from.id, 'photos-to-pdf', userStageData)
                }
            } else {
                await showUnknownPhotoSizeMessage(msg.from.id)
            }
        }
    } catch (err) {
        console.log(err)
    }
})
