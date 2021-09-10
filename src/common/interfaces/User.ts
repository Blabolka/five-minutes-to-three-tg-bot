export interface IUserModel {
    _id?: string
    telegram_id: number
    is_bot: boolean
    first_name: string
    last_name: string | null
    username: string | null
    language_code: string
}

export interface IUserRegister {
    telegram_id: number
    is_bot: boolean
    first_name: string
    last_name: string | null
    username: string | null
    language_code: string
}
