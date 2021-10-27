import bot from '@bot'
import { Message } from 'node-telegram-bot-api'
import stageManager from '@services/StageManager'
import { findOrCreateUser, mapUser } from '@utils/users'
import { showStartMenu } from '@controllers/menus/start'

// if user start using bot and send command '/start'
bot.on('message', async (msg: Message) => {
    try {
        if (msg.text === '/start' && msg.from) {
            await findOrCreateUser(mapUser(msg.from))
            stageManager.setStageForUser(msg.from.id, 'start')

            await showStartMenu(msg.from.id)
        }
    } catch (err) {
        console.error(err)
    }
})
