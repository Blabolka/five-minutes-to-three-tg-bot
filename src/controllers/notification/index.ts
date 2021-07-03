import bot from '@bot'
import { CallbackQuery, InlineKeyboardButton } from 'node-telegram-bot-api'

// if user press button 'notification' from another controller
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data === 'notification') {
            const addSubject: InlineKeyboardButton = { text: 'Добавить предмет', callback_data: 'addSubject' }
            const deleteSubject: InlineKeyboardButton = { text: 'Удалить предмет', callback_data: 'deleteSubject' }
            const turnNotifications: InlineKeyboardButton = { text: 'Включить уведомления', callback_data: 'turn' }
            const goBack: InlineKeyboardButton = { text: '« Назад', callback_data: 'start' }

            const keyboard: InlineKeyboardButton[][] = [[addSubject, deleteSubject], [turnNotifications], [goBack]]

            await bot.editMessageReplyMarkup(
                { inline_keyboard: keyboard },
                {
                    chat_id: callback.message?.chat.id,
                    message_id: callback.message?.message_id,
                },
            )
        }
    } catch (err) {
        console.log(err)
    }
})

import '@controllers/notification/addSubject/index'
import '@controllers/notification/deleteSubject/index'
import '@controllers/notification/turnNotifications/index'
