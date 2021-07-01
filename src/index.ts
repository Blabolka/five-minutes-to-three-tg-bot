import path from 'path'
import dotenv from 'dotenv'
import { Telegraf, Context } from 'telegraf'

const pathToEnv: string = path.resolve('.env')
dotenv.config({ path: pathToEnv })

const bot: Telegraf = new Telegraf(process.env.TG_BOT_KEY || 'error')

bot.on('text', async (ctx: Context) => {})

bot.launch()
    .then(() => {
        console.log('Bot started.')
    })
    .catch(() => {
        console.log('Error starting bot')
    })
