import bot from '@bot'
import sanitize from 'sanitize-filename'
import stageManager from '@services/StageManager'
import { CallbackQuery } from 'node-telegram-bot-api'
import { findOrCreateUser, mapUser } from '@utils/users'
import { PhotosToPdfConvertingInfo } from '@interfaces/PhotosToPdf'
import { showPhotosToPdfConvertMenu } from '@controllers/menus/photos-to-pdf'

// show user converting from photos to pdf menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== 'photos-to-pdf') return
        await findOrCreateUser(mapUser(callback.from))

        const convertPhotosToPdfStageInfo: PhotosToPdfConvertingInfo = {
            fileIds: [],
            filesSummarySize: 0,
            sizeLimitMessageWasShown: false,
            outputFileName: sanitize(callback.from.first_name) || 'filename',
            isConvertingInProcess: false,
        }

        stageManager.setStageForUser(callback.from.id, 'photos-to-pdf', convertPhotosToPdfStageInfo)

        await showPhotosToPdfConvertMenu(callback.from.id)

        await bot.answerCallbackQuery(callback.id)
    } catch (err) {
        console.log(err)
    }
})
