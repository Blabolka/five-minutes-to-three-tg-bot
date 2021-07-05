import db from '@db'
import { QueryResult } from 'pg'
import { Role } from '@enums/User'
import { User } from 'node-telegram-bot-api'
import { IUserInfo, IUserRegister } from '@interfaces/User'

export async function findOrCreateUser(user: IUserRegister): Promise<string> {
    const result: QueryResult = await db.query(
        `INSERT INTO users (telegram_id, is_bot, first_name, last_name, username, language_code, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (telegram_id) DO UPDATE SET is_bot=$2,
                                                 first_name=$3,
                                                 last_name=$4,
                                                 username=$5,
                                                 language_code=$6
         RETURNING id`,
        [user.telegram_id, user.is_bot, user.first_name, user.last_name, user.username, user.language_code, user.role],
    )

    return result.rows[0].id
}

export function mapUserRegister(user: User): IUserRegister {
    return {
        telegram_id: user.id,
        is_bot: user.is_bot,
        first_name: user.first_name,
        last_name: user.last_name || null,
        username: user.username || null,
        language_code: user.language_code || 'ru',
        role: Role.student,
    }
}

export async function findAllUserWithNotificationsStatus(status: boolean): Promise<IUserInfo[]> {
    const result: QueryResult = await db.query(
        `SELECT id,
                telegram_id,
                is_bot,
                first_name,
                last_name,
                username,
                language_code,
                role,
                notifications
         FROM users
         WHERE notifications = $1`,
        [status],
    )
    const users: IUserInfo[] = []
    for (const row of result.rows) {
        users.push(mapUserInfo(row))
    }
    return users
}

function mapUserInfo(row: IUserInfo): IUserInfo {
    return {
        id: row.id,
        telegram_id: row.telegram_id,
        is_bot: row.is_bot,
        first_name: row.first_name,
        last_name: row.last_name || null,
        username: row.username || null,
        language_code: row.language_code || 'ru',
        role: row.role,
        notifications: row.notifications,
    }
}
