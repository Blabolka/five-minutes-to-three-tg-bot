import bot from '@bot'
import { Message } from 'node-telegram-bot-api'
import { downloadFile, getFileInfo } from '@api/index'
import fs from 'fs'

bot.on('voice', async (msg: Message) => {
    try {
        if (msg.voice && msg.from) {
            await bot.sendChatAction(msg.from.id, 'record_audio')

            const data = await getFileInfo(msg.voice.file_id)
            const filePath = await downloadFile(data.file_path, 'mp3')

            await bot.sendAudio(msg.from.id, fs.createReadStream(filePath), {
                title: msg.forward_from ? msg.forward_from.first_name : msg.from.first_name,
                duration: msg.voice.duration,
            })

            fs.unlinkSync(filePath)
        }
    } catch (err) {
        console.log(err)
    }
})
