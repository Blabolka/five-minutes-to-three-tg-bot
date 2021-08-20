import bodyParser from 'body-parser'
import TelegramBot from 'node-telegram-bot-api'
import express, { Application, Request, Response, Router } from 'express'

// launch bot
const bot: TelegramBot = new TelegramBot(process.env.BOT_TOKEN || 'error')
bot.setWebHook(`${process.env.URL}/bot`)
    .then()
    .catch((err: Error) => console.log(err))

// set commands available for users
bot.setMyCommands([{ command: '/start', description: 'Начать работу с ботом' }]).then()

const app: Application = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const router: Router = Router()
router.post('/bot', (req: Request, res: Response) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
})

app.use(router)

app.listen(Number.parseInt(process.env.PORT as string), () => {
    console.log(`Listening on port ${process.env.PORT}`)
})

export default bot
