import fs from 'fs'
import bot from '@bot'
import logger from '@services/Logger'
import { Stages } from '@interfaces/Stages'
import { LogLevels } from '@interfaces/Logger'
import stageManager from '@services/StageManager'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import { showVideoNoteToMp4Menu } from '@controllers/menus/converting/video-note-to-mp4'
import { findOrCreateUser, getUserFilesDirectory, mapUser } from '@utils/users'

// show user converting from video note to mp4 menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== Stages.VIDEO_NOTE_TO_MP4) return
        const processTime = new Date()

        await findOrCreateUser(mapUser(callback.from))

        stageManager.setStageForUser(callback.from.id, Stages.VIDEO_NOTE_TO_MP4)

        await showVideoNoteToMp4Menu(callback.from.id)
        await bot.answerCallbackQuery(callback.id)

        logger.log(
            LogLevels.INFO,
            `Click '${Stages.VIDEO_NOTE_TO_MP4}' from start menu`,
            `USER: ${JSON.stringify(callback)}`,
            processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
        )
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            `Click '${Stages.VIDEO_NOTE_TO_MP4}' from start menu`,
            `USER: ${JSON.stringify(callback)}\nERROR: ${JSON.stringify(err)}`,
            0,
        )
    }
})

// if user send rounded video and exists in menu
bot.on('video_note', async (msg: Message) => {
    try {
        if (msg.video_note && msg.from && stageManager.isUserInStage(msg.from.id, Stages.VIDEO_NOTE_TO_MP4)) {
            const processTime = new Date()

            await findOrCreateUser(mapUser(msg.from))
            await bot.sendChatAction(msg.from.id, 'upload_video')

            const dirPath: string = getUserFilesDirectory(msg.from)

            const filePath: string = await bot.downloadFile(msg.video_note.file_id, dirPath)

            await bot.sendVideo(msg.from.id, fs.createReadStream(filePath), {
                duration: msg.video_note.duration,
            })

            fs.unlinkSync(filePath)

            logger.log(
                LogLevels.INFO,
                `Send file in '${Stages.VIDEO_NOTE_TO_MP4}' menu`,
                `USER: ${JSON.stringify(msg)}`,
                processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
            )
        }
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            `Send file in '${Stages.VIDEO_NOTE_TO_MP4}' menu`,
            `USER: ${JSON.stringify(msg)}\nERROR: ${JSON.stringify(err)}`,
            0,
        )
    }
})
