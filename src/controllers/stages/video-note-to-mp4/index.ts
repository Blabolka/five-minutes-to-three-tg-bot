import fs from 'fs'
import bot from '@bot'
import stageManager from '@services/StageManager'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import { showVideoNoteToMp4Menu } from '@controllers/menus/video-note-to-mp4'
import { findOrCreateUser, getUserFilesDirectory, mapUser } from '@utils/users'

// show user converting from video note to mp4 menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    if (callback.data !== 'video-note-to-mp4') return

    await findOrCreateUser(mapUser(callback.from))
    stageManager.setStageForUser(callback.from.id, 'video-note-to-mp4')

    await showVideoNoteToMp4Menu(callback.from.id)

    await bot.answerCallbackQuery(callback.id)
})

// if user send rounded video and exists in menu
bot.on('video_note', async (msg: Message) => {
    try {
        if (msg.video_note && msg.from && stageManager.isUserInStage(msg.from.id, 'video-note-to-mp4')) {
            await findOrCreateUser(mapUser(msg.from))
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
