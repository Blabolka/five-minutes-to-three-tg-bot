import bot from '@bot'
import fs from 'fs'
import { Message } from 'node-telegram-bot-api'
import { downloadFile, getFileInfo } from '@api/index'

bot.on('video_note', async (msg: Message) => {
    try {
        if (msg.video_note && msg.from) {
            await bot.sendChatAction(msg.from.id, 'upload_video')

            const data = await getFileInfo(msg.video_note.file_id)
            const filePath = await downloadFile(data.file_path)
            await bot.sendVideo(msg.from.id, fs.createReadStream(filePath))
        }
    } catch (err) {
        console.log(err)
    }
})
