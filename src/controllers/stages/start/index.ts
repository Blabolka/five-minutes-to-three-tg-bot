import bot from '@bot'
import { Message } from 'node-telegram-bot-api'
import { findOrCreateUser, mapUser } from '@utils/users'

bot.on('message', async (msg: Message) => {
    try {
        if (msg.text === '/start' && msg.from) {
            await findOrCreateUser(mapUser(msg.from))
        }
    } catch (err) {
        console.error(err)
    }
})
