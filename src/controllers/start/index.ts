import bot from '@bot'
import { KeyboardButton, Message } from 'node-telegram-bot-api'
import { IUser } from '@interfaces/IUser'
import { findOrCreateUser, mapUser } from '@utils/users'

const addSubject: KeyboardButton = { text: 'Добавить предмет' }
const deleteSubject: KeyboardButton = { text: 'Удалить предмет' }
const keyboard: KeyboardButton[][] = [[addSubject, deleteSubject]]

bot.onText(/\/start/, async (msg: Message) => {
    try {
        if (msg.from) {
            const userInfo: IUser = mapUser(msg.from)
            await findOrCreateUser(userInfo)
        }

        await bot.sendMessage(msg.chat.id, 'Добро пожаловать! Выбери нужную тебе категорию.', {
            reply_markup: {
                keyboard: keyboard,
            },
        })
    } catch (err) {
        console.log(err)
    }
})
