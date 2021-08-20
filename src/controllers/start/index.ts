import bot from '@bot'
import { Message } from 'node-telegram-bot-api'
import { mapUser } from '@utils/users'
import { IUserRegister } from '@interfaces/User'
import UserModel from '@models/User'

bot.on('message', (msg: Message) => {
    try {
        if (msg.text === '/start' && msg.from) {
            const user: IUserRegister = mapUser(msg.from)
            UserModel.findOneAndUpdate(
                { telegram_id: user.telegram_id },
                {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                },
                {
                    upsert: true,
                    useFindAndModify: false,
                },
            )
        }
    } catch (err) {
        console.error(err)
    }
})
