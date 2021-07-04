import bot from '@bot'
import { CallbackQuery, InlineKeyboardButton, Message } from 'node-telegram-bot-api'
import { parseAddSubjectText, validateAddSubjectText } from '@utils/notifications'
import { ISubjectAdd } from '@interfaces/Subject'
import { createSubject, subjectExistsOnTime } from '@utils/subjects'

// after click 'add subject' on notifications page
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data === 'addSubject' && callback.message) {
            // add user to list of tracked listener on input text
            usersTrackedListener.push(callback.from.id)
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

// array of users that will be listened by the listener
const usersTrackedListener: number[] = []
bot.on('text', async (msg: Message) => {
    try {
        const notification: InlineKeyboardButton = { text: '« Назад', callback_data: 'notifications' }
        const mainMenu: InlineKeyboardButton = { text: '🏠 Главное меню', callback_data: 'start' }
        const keyboard: InlineKeyboardButton[][] = [[notification, mainMenu]]

        // if the user is not tracked by this listener
        if (msg.from) {
            const indexUser: number = usersTrackedListener.indexOf(msg.from.id)
            if (indexUser === -1) {
                return
            }
        }

        // if user input command from command's list
        if (msg.text && msg.from) {
            for (const command of await bot.getMyCommands()) {
                if (command.command === msg.text.substring(1)) {
                    const indexUser: number = usersTrackedListener.indexOf(msg.from.id)
                    usersTrackedListener.splice(indexUser, 1)
                    return
                }
            }
        }

        // if user want cancel action and go back
        if (msg.text === '/cancel' && msg.from) {
            const indexUser: number = usersTrackedListener.indexOf(msg.from.id)
            usersTrackedListener.splice(indexUser, 1)
            await bot.sendMessage(msg.chat.id, 'Выберите действие.', {
                reply_markup: {
                    inline_keyboard: keyboard,
                },
            })
            return
        }

        if (msg.text && msg.from) {
            const validateInfo: string | boolean = validateAddSubjectText(msg.text)

            if (typeof validateInfo === 'string') {
                // if contain error show this message with errors to user
                await bot.sendMessage(msg.chat.id, 'Пожалуйста, введите корректные данные.\n\n' + validateInfo)
            } else if (!validateInfo) {
                // if unexpected error show message to user
                await bot.sendMessage(msg.chat.id, 'Пожалуйста, введите корректные данные.')
            } else if (validateInfo) {
                // if user input right format text
                const subjectInfo: ISubjectAdd = await parseAddSubjectText(msg.text, msg.from)
                if (!(await subjectExistsOnTime(subjectInfo))) {
                    // if all is OK
                    await createSubject(subjectInfo)
                    const indexUser: number = usersTrackedListener.indexOf(msg.from.id)
                    usersTrackedListener.splice(indexUser, 1)
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
})
