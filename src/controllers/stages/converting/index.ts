import bot from '@bot'
import logger from '@services/Logger'
import { Stages } from '@interfaces/Stages'
import { LogLevels } from '@interfaces/Logger'
import stageManager from '@services/StageManager'
import { CallbackQuery } from 'node-telegram-bot-api'
import { findOrCreateUser, mapUser } from '@utils/users'
import { showConvertingMenu } from '@controllers/menus/converting'

// import nested menu stages
import '@controllers/stages/converting/voice-to-mp3/index'
import '@controllers/stages/converting/photos-to-pdf/index'
import '@controllers/stages/converting/video-note-to-mp4/index'

// show user converting menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== Stages.CONVERTING_MENU) return
        const processTime = new Date()

        await findOrCreateUser(mapUser(callback.from))

        stageManager.setStageForUser(callback.from.id, Stages.CONVERTING_MENU)

        await showConvertingMenu(callback.from.id)

        await bot.answerCallbackQuery(callback.id)

        logger.log(
            LogLevels.INFO,
            'Converting menu',
            `USER: ${JSON.stringify(callback.from, null, 4)}`,
            processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
        )
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            'Converting menu',
            `USER: ${JSON.stringify(callback.from, null, 4)}\nERROR: ${JSON.stringify(err, null, 4)}`,
            0,
        )
    }
})
