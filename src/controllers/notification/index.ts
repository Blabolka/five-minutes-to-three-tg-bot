import bot from '@bot'
import { findOrCreateUser, mapUserRegister } from '@utils/users'
import { getUserNotificationsStatus } from '@utils/notifications'
import { CallbackQuery, InlineKeyboardButton } from 'node-telegram-bot-api'

// if user press button 'notification' from another controller
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data === 'notifications') {
            const addSubject: InlineKeyboardButton = { text: 'Добавить предмет', callback_data: 'addSubject' }
            const deleteSubject: InlineKeyboardButton = { text: 'Удалить предмет', callback_data: 'deleteSubject' }

            let turn: InlineKeyboardButton
            const userId: string = await findOrCreateUser(mapUserRegister(callback.from))
            if (await getUserNotificationsStatus(userId)) {
                turn = { text: '🔔 Выключить уведомления', callback_data: 'turnNotifications' }
            } else {
                turn = { text: '🔕 Включить уведомления', callback_data: 'turnNotifications' }
            }

            const goBack: InlineKeyboardButton = { text: '« Назад', callback_data: 'start' }

            const keyboard: InlineKeyboardButton[][] = [[addSubject, deleteSubject], [turn], [goBack]]

            await bot.editMessageText('Выберите нужную вам категорию.', {
                reply_markup: {
                    inline_keyboard: keyboard,
                },
                chat_id: callback.message?.chat.id,
                message_id: callback.message?.message_id,
            })
            await bot.answerCallbackQuery(callback.id)
        }
    } catch (err) {
        console.log(err)
    }
})

// import nested functionality
import '@controllers/notification/addSubject/index'
import '@controllers/notification/deleteSubject/index'
import '@controllers/notification/turnNotifications/index'
