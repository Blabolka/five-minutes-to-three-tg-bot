import bot from '@bot'
import { WeekDayShortRus } from '@enums/Subject'
import { ISubjectInfo } from '@interfaces/Subject'
import { findOrCreateUser, mapUserRegister } from '@utils/users'
import { CallbackQuery, InlineKeyboardButton } from 'node-telegram-bot-api'
import { deleteSubjectById, findAllSubjectsByUserId } from '@utils/subjects'

// after click 'delete subject' or current subject on subjects stage
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        const data: string[] | undefined = callback.data?.split(' ')

        if (data && data[0] === 'deleteSubject') {
            if (data[1]) {
                await deleteSubjectById(data[1])
            }

            const userId: string = await findOrCreateUser(mapUserRegister(callback.from))
            const subjects: ISubjectInfo[] = await findAllSubjectsByUserId(userId)

            const keyboard: InlineKeyboardButton[][] = []
            // fill with subject buttons
            for (const subject of subjects) {
                // | padStart | 8:30 -> 08:30 | 15:5 -> 15:05 |
                const time: string =
                    String(subject.time.getHours()).padStart(2, '0') +
                    ':' +
                    String(subject.time.getMinutes()).padStart(2, '0')
                const weekDay: WeekDayShortRus =
                    Object.values(WeekDayShortRus)[Object.keys(WeekDayShortRus).indexOf(subject.week_day)]
                const text: string = subject.title + ', ' + weekDay + ', ' + time
                const callback_data: string = 'deleteSubject ' + subject.id
                keyboard.push([{ text: text, callback_data: callback_data }])
            }

            const goBack: InlineKeyboardButton = { text: '« Назад', callback_data: 'notifications' }
            keyboard.push([goBack])

            await bot.editMessageText('Выберите предмет для удаления.', {
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
