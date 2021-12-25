import bodyParser from 'body-parser'
import commands from '@common/commands.js'
import TelegramBot from 'node-telegram-bot-api'
import express, { Application, Request, Response, Router } from 'express'

// launch bot
const bot: TelegramBot = new TelegramBot(process.env.BOT_TOKEN || 'error')
bot.setWebHook(`${process.env.URL}/bot`)
    .then()
    .catch((err: Error) => console.log(err))

// set all bot commands
commands.forEach((stage) => {
    bot.setMyCommands([{ command: stage.command, description: stage.description }]).then()
})

const app: Application = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const router: Router = Router()

// Send OK on heroku add-on ping
router.get('/', (req: Request, res: Response) => {
    res.sendStatus(200).send('OK')
})
// webhook for bot
router.post('/bot', (req: Request, res: Response) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
})

app.use(router)

app.listen(Number.parseInt(process.env.PORT as string), () => {
    console.log(`Listening on port ${process.env.PORT}`)
})

export default bot
