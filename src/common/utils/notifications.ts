import db from '@db'
import { QueryResult } from 'pg'
import { WeekDay } from '@enums/Subject'
import { User } from 'node-telegram-bot-api'
import { ISubjectAdd } from '@interfaces/Subject'
import { findOrCreateUser, mapUserRegister } from '@utils/users'

/**
 * Validate text from user for add subject
 * return type 'string' with error messages if exists
 * return 'true' if OK
 * return 'false' if unexpected error
 */
export function validateAddSubjectText(text: string): string | boolean {
    try {
        let error: string = ''

        // validate common format
        const rows: string[] = text.split('\n')
        if (rows.length < 3 || rows.length > 4) {
            error += 'Неполные данные.'
            return error
        }

        // validate subject title row
        // 30 - max length of string in database
        if (rows[0].length > 30) {
            error += 'Слишком длинное название предмета (нельзя больше 30 символов).'
            return error
        }

        // validate week day row
        const weekDayNumber: number = Number.parseInt(rows[1])
        if (!weekDayNumber || weekDayNumber < 1 || weekDayNumber > 7) {
            error += 'Некорректный день недели (только числа от 1 до 7).'
            return error
        }

        // validate date row
        const splitDate: string[] = rows[2].split(':')
        if (splitDate.length === 2) {
            const first: number = Number.parseInt(splitDate[0])
            const second: number = Number.parseInt(splitDate[1])
            if (isNaN(first) || isNaN(second) || first < 0 || first > 23 || second < 0 || second > 59) {
                error += 'Некорректные значения во времени пары.'
                return error
            }
        } else {
            error += 'Некорректный формат времени (пример 16:30).'
            return error
        }

        // validate link row (if link exists)
        if (rows[3]) {
            if (rows[3].length > 100) {
                error += 'Слишком длинная ссылка (нельзя больше 100 символов).'
                return error
            }
        }

        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

// call after validate method for correct work
export async function parseAddSubjectText(text: string, user: User): Promise<ISubjectAdd> {
    const rows: string[] = text.split('\n')

    // find userId from database
    const userId: string = await findOrCreateUser(mapUserRegister(user))
    // parse title from text
    const title: string = rows[0]

    // parse week day from text
    const weekDayNumber: number = Number.parseInt(rows[1])
    const weekDay: WeekDay = Object.values(WeekDay)[weekDayNumber - 1]

    // parse time from text
    const splitTime: string[] = rows[2].split(':')
    const time: Date = new Date(0, 0, 0, Number.parseInt(splitTime[0]), Number.parseInt(splitTime[1]))

    // parse link from text if exists
    const link: string | null = rows[3] ? rows[3] : null

    return {
        user_id: userId,
        title: title,
        week_day: weekDay,
        time: time,
        link: link,
    }
}

export async function toggleUserNotifications(userId: string): Promise<void> {
    await db.query(
        `UPDATE users
         SET notifications = NOT notifications
         WHERE id = $1`,
        [userId],
    )
}

// return true if user activate notifications, else return false
export async function getUserNotificationsStatus(userId: string): Promise<boolean> {
    const result: QueryResult = await db.query(
        `SELECT notifications
         FROM users
         WHERE id = $1`,
        [userId],
    )
    return result.rows[0].notifications
}
