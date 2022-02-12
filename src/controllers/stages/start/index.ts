import bot from '@bot'
import logger from '@services/Logger'
import { Stages } from '@interfaces/Stages'
import { LogLevels } from '@interfaces/Logger'
import { Message } from 'node-telegram-bot-api'
import stageManager from '@services/StageManager'
import { findOrCreateUser, mapUser } from '@utils/users'
import { showStartMenu } from '@controllers/menus/start'

// if user start using bot and send command '/start'
bot.on('message', async (msg: Message) => {
    try {
        if (msg.text === '/start' && msg.from) {
            const processTime = new Date()

            await findOrCreateUser(mapUser(msg.from))

            stageManager.setStageForUser(msg.from.id, Stages.START)

            await showStartMenu(msg.from.id)

            logger.log(
                LogLevels.INFO,
                'Start menu',
                `USER: ${JSON.stringify(msg.from, null, 4)}`,
                processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
            )
        }
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            'Start menu',
            `USER: ${JSON.stringify(msg.from, null, 4)}\nERROR: ${JSON.stringify(err, null, 4)}`,
            0,
        )
    }
})
