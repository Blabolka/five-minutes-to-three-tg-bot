import bot from '@bot'
import { Message } from 'node-telegram-bot-api'

bot.on('message', async (msg: Message) => {
    try {
        console.log(msg)
    } catch (err) {
        console.log(err)
    }
})
