import bot from '@bot'
import logger from '@services/Logger'
import sanitize from 'sanitize-filename'
import { Stages } from '@interfaces/Stages'
import { LogLevels } from '@interfaces/Logger'
import stageManager from '@services/StageManager'
import { CallbackQuery } from 'node-telegram-bot-api'
import { findOrCreateUser, mapUser } from '@utils/users'
import { PhotosToPdfConvertingInfo } from '@interfaces/PhotosToPdf'
import { showPhotosToPdfConvertMenu } from '@controllers/menus/converting/photos-to-pdf'

// show user converting from photos to pdf menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== Stages.PHOTOS_TO_PDF) return
        const processTime = new Date()

        await findOrCreateUser(mapUser(callback.from))

        const convertPhotosToPdfStageInfo: PhotosToPdfConvertingInfo = {
            fileIds: [],
            filesSummarySize: 0,
            sizeLimitMessageWasShown: false,
            outputFileName: sanitize(callback.from.first_name) || 'filename',
            isConvertingInProcess: false,
        }

        stageManager.setStageForUser(callback.from.id, Stages.PHOTOS_TO_PDF, convertPhotosToPdfStageInfo)

        await showPhotosToPdfConvertMenu(callback.from.id)

        await bot.answerCallbackQuery(callback.id)

        logger.log(
            LogLevels.INFO,
            `Click '${Stages.PHOTOS_TO_PDF}' from start menu`,
            `USER: ${JSON.stringify(callback.from, null, 4)}`,
            processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
        )
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            `Click '${Stages.PHOTOS_TO_PDF}' from start menu`,
            `USER: ${JSON.stringify(callback.from, null, 4)}\nERROR: ${JSON.stringify(err, null, 4)}`,
            0,
        )
    }
})
