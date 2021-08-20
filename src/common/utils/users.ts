import { User } from 'node-telegram-bot-api'
import { IUserRegister } from '@interfaces/User'

export function mapUser(user: User): IUserRegister {
    return {
        telegram_id: user.id,
        is_bot: user.is_bot,
        first_name: user.first_name,
        last_name: user.last_name || null,
        username: user.username || null,
    }
}
