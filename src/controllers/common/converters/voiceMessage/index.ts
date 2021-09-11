import bot from '@bot'
import { Message } from 'node-telegram-bot-api'
import fs from 'fs'
import { findOrCreateUser, getUserFilesDirectory, mapUser } from '@utils/users'
import path from 'path'

bot.on('voice', async (msg: Message) => {
    try {
        if (msg.voice && msg.from) {
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
