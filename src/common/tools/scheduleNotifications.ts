import bot from '@bot'
import { schedule } from 'node-cron'
import { WeekDay } from '@enums/Subject'
import { IUserInfo } from '@interfaces/User'
import { findAllSubjects } from '@utils/subjects'
import { ISubjectInfo } from '@interfaces/Subject'
import { findAllUserWithNotificationsStatus } from '@utils/users'

schedule('* * * * *', async () => {
    const subjects: ISubjectInfo[] = await findAllSubjects()
    const userWithEnabledNotifications: IUserInfo[] = await findAllUserWithNotificationsStatus(true)

    for (const user of userWithEnabledNotifications) {
        for (const subject of subjects) {
            if (user.id === subject.user_id && compareTimeWithNow(subject.time, subject.week_day)) {
                await bot.sendMessage(user.telegram_id, subjectToString(subject))
            }
        }
    }
})

function compareTimeWithNow(time: Date, weekDay: WeekDay): boolean {
    const currentTime: Date = new Date()

    const dayOfWeekCurrentTime: number = currentTime.getDay() - 1 === -1 ? 7 : currentTime.getDay() - 1
    const dayOfWeek: number = Object.keys(WeekDay).indexOf(weekDay)

    const hoursCurrentTime: number = currentTime.getHours()
    const hours: number = time.getHours()

    const minutesCurrentTime: number = currentTime.getMinutes()
    const minutes: number = time.getMinutes()

    return dayOfWeekCurrentTime === dayOfWeek && hoursCurrentTime === hours && minutesCurrentTime === minutes
}

function subjectToString(subject: ISubjectInfo): string {
    let result: string = '❗' + subject.title + '❗'
    if (subject.link) {
        result += '\n\n' + subject.link
    }

    return result
}
