import db from '@db'
import { IUser } from '@interfaces/IUser'
import { User } from 'node-telegram-bot-api'
import { Role } from '@enums/User'
import { QueryResult } from 'pg'

export function mapUser(user: User): IUser {
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

export async function findOrCreateUser(user: IUser): Promise<string> {
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
