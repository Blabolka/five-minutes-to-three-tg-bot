import path from 'path'
import dotenv from 'dotenv'

const pathToEnv: string = path.resolve('.env')
dotenv.config({ path: pathToEnv })
import TelegramBot, { Message } from 'node-telegram-bot-api'

const bot: TelegramBot = new TelegramBot(process.env.TG_BOT_KEY || 'error', { polling: true })
console.log('Bot started.')

bot.on('message', (ctx: Message) => {
    console.log(ctx)
})
