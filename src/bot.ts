import TelegramBot from 'node-telegram-bot-api'

const bot: TelegramBot = new TelegramBot(process.env.TG_BOT_KEY || 'error', { polling: true })
console.log('Bot started.')

export default bot
