import bot from '@bot'
import { CallbackQuery, InlineKeyboardButton } from 'node-telegram-bot-api'
import { findOrCreateUser, mapUser } from '@utils/users'
import { getUserNotificationsStatus, toggleUserNotifications } from '@utils/notifications'

// after click turn on/off notifications
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data === 'turnNotifications' && callback.message?.reply_markup?.inline_keyboard) {
            // find user from db or add if not exists
            const userId: string = await findOrCreateUser(mapUser(callback.from))
            // change boolean value (true-enable / false-disable)
            await toggleUserNotifications(userId)

            let newNotificationStatus: InlineKeyboardButton
            const keyboard: InlineKeyboardButton[][] = callback.message.reply_markup.inline_keyboard
            if (await getUserNotificationsStatus(userId)) {
                newNotificationStatus = { text: 'Выключить уведомления', callback_data: 'turnNotifications' }
            } else {
                newNotificationStatus = { text: 'Включить уведомления', callback_data: 'turnNotifications' }
            }
            keyboard[1][0] = newNotificationStatus

            await bot.editMessageReplyMarkup(
                { inline_keyboard: keyboard },
                {
                    chat_id: callback.message.chat.id,
                    message_id: callback.message.message_id,
                },
            )
            await bot.answerCallbackQuery(callback.id)
        }
    } catch (err) {
        console.log(err)
    }
})
