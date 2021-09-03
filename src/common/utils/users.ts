import { User } from 'node-telegram-bot-api'
import { IUserModel, IUserRegister } from '@interfaces/User'
import UserModel from '@models/User'
import fs from 'fs'
import { UserFiles } from '@interfaces/UserFiles'

// map telegram user for matching database user
export function mapUser(user: User): IUserRegister {
    return {
        telegram_id: user.id,
        is_bot: user.is_bot,
        first_name: user.first_name,
        last_name: user.last_name || null,
        username: user.username || null,
    }
}

// find user in database otherwise create new user
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

// create and return personal user directory to avoid conflict between different user files
export function getUserFilesDirectory(user: User): string {
    function createFolderIfNotExists(path: string) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
    }

    let dirPath = './files'

    createFolderIfNotExists(dirPath)
    dirPath += '/' + user.id
    createFolderIfNotExists(dirPath)

    return dirPath
}

export function getUserSentFiles(userFiles: UserFiles[], searchUserId: number): string[] | null {
    const userInfo: UserFiles | undefined = userFiles.find(({ userId }: UserFiles) => {
        return userId === searchUserId
    })

    return userInfo ? userInfo.fileIds : null
}

export function getUserSentOutputFileName(userFiles: UserFiles[], searchUserId: number): string | null {
    const userInfo: UserFiles | undefined = userFiles.find(({ userId }: UserFiles) => {
        return userId === searchUserId
    })

    return userInfo ? userInfo.outputFileName : null
}
