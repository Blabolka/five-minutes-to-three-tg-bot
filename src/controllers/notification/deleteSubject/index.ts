import bot from '@bot'
import { CallbackQuery } from 'node-telegram-bot-api'
import { findAllSubjectsByUserId } from '@utils/subjects'
import { findOrCreateUser, mapUser } from '@utils/users'
import { ISubjectInfo } from '@interfaces/Subject'

bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data === 'deleteSubject') {
            const userId: string = await findOrCreateUser(mapUser(callback.from))
            const subjects: ISubjectInfo[] = await findAllSubjectsByUserId(userId)

            await bot.answerCallbackQuery(callback.id)
        }
    } catch (err) {
        console.log(err)
    }
})
