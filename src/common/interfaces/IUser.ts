import { Role } from '@enums/User'

export interface IUser {
    telegram_id: number
    is_bot: boolean
    first_name: string
    last_name: string | null
    username: string | null
    language_code: string | null
    role: Role
}
