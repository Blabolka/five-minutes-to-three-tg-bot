import bot from '@bot'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import { findOrCreateUser, getUserFilesDirectory, mapUser } from '@utils/users'
import path from 'path'
import fs from 'fs'
import { showVoiceToMp3Menu } from '@controllers/menus/voice-to-mp3'
import { isEntitiesIncludeSomeStage } from '@utils/stages'

let usersInMenu: number[] = []

// show user converting from voices to mp3 menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    if (callback.data !== 'voice-to-mp3') return
    await findOrCreateUser(mapUser(callback.from))

    if (!isUserExistsInMenu(callback.from.id)) {
        usersInMenu.push(callback.from.id)
    }

    await showVoiceToMp3Menu(callback.from.id)

    await bot.answerCallbackQuery(callback.id)
})

// if user change stage to another
bot.on('message', async (msg: Message) => {
    try {
        if (msg.from && msg.text && msg.entities && isEntitiesIncludeSomeStage(msg.entities, msg.text)) {
            await findOrCreateUser(mapUser(msg.from))
            removeUserFromList(msg.from.id)
        }
    } catch (err) {
        console.log(err)
    }
})

// if user send voice message and exists in the menu
bot.on('voice', async (msg: Message) => {
    try {
        if (msg.voice && msg.from && isUserExistsInMenu(msg.from.id)) {
            await findOrCreateUser(mapUser(msg.from))
            await bot.sendChatAction(msg.from.id, 'record_audio')

            const dirPath: string = getUserFilesDirectory(msg.from)

            const filePath: string = await bot.downloadFile(msg.voice.file_id, dirPath)

            // change file extension
            const oldExtension = path.extname(filePath)
            const newExtension = '.mp3'
            const newFilePath = filePath.substring(0, filePath.lastIndexOf(oldExtension)) + newExtension

            await new Promise((resolve, reject) => {
                fs.rename(filePath, newFilePath, (err) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(newFilePath)
                })
            })

            await bot.sendAudio(msg.from.id, fs.createReadStream(newFilePath), {
                title: msg.forward_from ? msg.forward_from.first_name : msg.from.first_name,
                duration: msg.voice.duration,
            })

            fs.unlinkSync(newFilePath)
        }
    } catch (err) {
        console.log(err)
    }
})

function isUserExistsInMenu(userId: number): boolean {
    return usersInMenu.some((id) => id === userId)
}

function removeUserFromList(userId: number): void {
    usersInMenu = usersInMenu.filter((id) => id !== userId)
}
