import bot from '@bot'
import { CallbackQuery, InlineKeyboardButton, Message } from 'node-telegram-bot-api'
import { saveUser } from '@utils/start'

const notificationMenu: InlineKeyboardButton = { text: 'Уведомления о парах', callback_data: 'notification' }
const keyboard: InlineKeyboardButton[][] = [[notificationMenu]]

// if user start using bot and send command '/start'
bot.on('message', async (msg: Message) => {
    if (msg.text === '/start' && msg.from) {
        // save user to database
        await saveUser(msg.from)

        await bot.sendMessage(msg.from.id, 'Добро пожаловать!')
        await bot.sendMessage(msg.from.id, 'Выбери нужную тебе категорию.', {
            reply_markup: {
                inline_keyboard: keyboard,
            },
        })
    }
})

// if user press button 'back' from another controller
bot.on('callback_query', async (callback: CallbackQuery) => {
    if (callback.data === 'start') {
        await bot.editMessageReplyMarkup(
            { inline_keyboard: keyboard },
            {
                chat_id: callback.message?.chat.id,
                message_id: callback.message?.message_id,
            },
        )
    }
})
