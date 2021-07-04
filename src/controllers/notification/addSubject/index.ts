import bot from '@bot'
import { CallbackQuery, InlineKeyboardButton, Message } from 'node-telegram-bot-api'
import { parseAddSubjectText, validateAddSubjectText } from '@utils/notifications'
import { ISubjectAdd } from '@interfaces/Subject'
import { createSubject, subjectExistsOnTime } from '@utils/subjects'

// after click 'add subject' on notifications page
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data === 'addSubject' && callback.message) {
            // listener for input text
            bot.addListener('text', textListener)
            const text: string =
                'Хорошо. Отправьте сообщение в таком формате:\n\n' +
                'Название предмета\n' +
                'День недели (1-пн, 7-вс)\n' +
                'Время (например: 13:30)\n' +
                'Ссылка на пару (не обязательно)\n' +
                '\nОтменить действие: /cancel'
            await bot.sendMessage(callback.message.chat.id, text)
            await bot.answerCallbackQuery(callback.id)
        }
    } catch (err) {
        console.log(err)
    }
})

// after click 'Add subject' (auto deleted listener if user input right format text)
const textListener: (msg: Message) => void = async (msg: Message) => {
    try {
        const notification: InlineKeyboardButton = { text: '« Назад', callback_data: 'notifications' }
        const mainMenu: InlineKeyboardButton = { text: '🏠 Главное меню', callback_data: 'start' }
        const keyboard: InlineKeyboardButton[][] = [[notification, mainMenu]]

        // if user want cancel action and go back
        if (msg.text === '/cancel') {
            bot.removeListener('text', textListener)
            await bot.sendMessage(msg.chat.id, 'Выберите действие.', {
                reply_markup: {
                    inline_keyboard: keyboard,
                },
            })
            return
        }

        if (msg.text) {
            const validateInfo: string | boolean = validateAddSubjectText(msg.text)

            if (typeof validateInfo === 'string') {
                // if contain error show this message with errors to user
                await bot.sendMessage(msg.chat.id, 'Пожалуйста, введите корректные данные.\n\n' + validateInfo)
            } else if (!validateInfo) {
                // if unexpected error show message to user
                await bot.sendMessage(msg.chat.id, 'Пожалуйста, введите корректные данные.')
            } else if (validateInfo && msg.from) {
                // if user input right format text
                const subjectInfo: ISubjectAdd = await parseAddSubjectText(msg.text, msg.from)
                if (!(await subjectExistsOnTime(subjectInfo))) {
                    // if all is OK
                    await createSubject(subjectInfo)
                    bot.removeListener('text', textListener)
                    await bot.sendMessage(msg.chat.id, 'Уведомление было успешно добавлено!\nВыберите действие.', {
                        reply_markup: {
                            inline_keyboard: keyboard,
                        },
                    })
                } else {
                    // if another subject exists on this time and week day
                    await bot.sendMessage(msg.chat.id, 'Это время уже занято другим предметом.')
                }
            }
        }
    } catch (err) {
        console.log(err)
    }
}
