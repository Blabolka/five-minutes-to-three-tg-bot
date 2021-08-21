import { User } from 'node-telegram-bot-api'
import { IUserModel, IUserRegister } from '@interfaces/User'
import UserModel from '@models/User'

export function mapUser(user: User): IUserRegister {
    return {
        telegram_id: user.id,
        is_bot: user.is_bot,
        first_name: user.first_name,
        last_name: user.last_name || null,
        username: user.username || null,
    }
}

export async function findOrCreateUser(user: IUserRegister): Promise<IUserModel | null> {
    return await UserModel.findOneAndUpdate(
        { telegram_id: user.telegram_id },
        {
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
        },
        {
            upsert: true,
            useFindAndModify: false,
        },
    ).exec()
}