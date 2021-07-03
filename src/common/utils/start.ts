import { User } from 'node-telegram-bot-api'
import { IUserRegister } from '@interfaces/User'
import { findOrCreateUser, mapUser } from '@utils/users'

export async function saveUser(user: User): Promise<void> {
    try {
        const userInfo: IUserRegister = mapUser(user)
        await findOrCreateUser(userInfo)
    } catch (err) {
        console.log(err)
    }
}
