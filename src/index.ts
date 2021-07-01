import path from 'path'
import dotenv from 'dotenv'

const pathToEnv: string = path.resolve('.env')
dotenv.config({ path: pathToEnv })

import { Telegraf, Context } from 'telegraf'

const bot: Telegraf = new Telegraf(process.env.TG_BOT_KEY || 'error')

bot.on('text', async (ctx: Context) => {
    console.log(ctx.from)
})

bot.launch()
    .then((): void => console.log('Bot started.'))
    .catch((err: Error): void => console.log(err))
