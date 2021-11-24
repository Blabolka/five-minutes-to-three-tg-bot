import bot from '@bot'
import logger from '@services/Logger'
import { Stages } from '@interfaces/Stages'
import { LogLevels } from '@interfaces/Logger'
import stageManager from '@services/StageManager'
import { CallbackQuery } from 'node-telegram-bot-api'
import { findOrCreateUser, mapUser } from '@utils/users'
import { showModificationMenu } from '@controllers/menus/modification'

// import nested menu stages
import '@controllers/stages/modification/delete-metadata/index'

// show user converting menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== Stages.MODIFICATION_MENU) return
        const processTime = new Date()

        await findOrCreateUser(mapUser(callback.from))

        stageManager.setStageForUser(callback.from.id, Stages.MODIFICATION_MENU)

        await showModificationMenu(callback.from.id)

        await bot.answerCallbackQuery(callback.id)

        logger.log(
            LogLevels.INFO,
            'Modification menu',
            `USER: ${JSON.stringify(callback.from)}`,
            processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
        )
    } catch (err) {
        logger.log(LogLevels.INFO, 'Modification menu', `USER: ${JSON.stringify(callback.from)}`, 0)
    }
})
