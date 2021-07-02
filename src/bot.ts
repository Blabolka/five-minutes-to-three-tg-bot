import TelegramBot from 'node-telegram-bot-api'

// launch bot
const bot: TelegramBot = new TelegramBot(process.env.TG_BOT_KEY || 'error', { polling: true })

// set commands available for users
bot.setMyCommands([{ command: '/start', description: 'Начать работу с ботом' }]).then()

console.log('Bot started.')
export default bot
