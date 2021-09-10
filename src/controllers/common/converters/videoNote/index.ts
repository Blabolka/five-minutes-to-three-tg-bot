import bot from '@bot'
import { Message } from 'node-telegram-bot-api'
import { getUserFilesDirectory } from '@utils/users'
import fs from 'fs'

bot.on('video_note', async (msg: Message) => {
    try {
        if (msg.video_note && msg.from) {
            await bot.sendChatAction(msg.from.id, 'upload_video')

            const dirPath: string = getUserFilesDirectory(msg.from)

            const filePath: string = await bot.downloadFile(msg.video_note.file_id, dirPath)

            await bot.sendVideo(msg.from.id, fs.createReadStream(filePath), {
                duration: msg.video_note.duration,
            })

            fs.unlinkSync(filePath)
        }
    } catch (err) {
        console.log(err)
    }
})
