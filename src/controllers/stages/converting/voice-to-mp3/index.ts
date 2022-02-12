import fs from 'fs'
import bot from '@bot'
import path from 'path'
import logger from '@services/Logger'
import { Stages } from '@interfaces/Stages'
import { LogLevels } from '@interfaces/Logger'
import stageManager from '@services/StageManager'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import { showVoiceToMp3Menu } from '@controllers/menus/converting/voice-to-mp3'
import { findOrCreateUser, getUserFilesDirectory, mapUser } from '@utils/users'

// show user converting from voices to mp3 menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== Stages.VOICE_TO_MP3) return
        const processTime = new Date()

        await findOrCreateUser(mapUser(callback.from))
        stageManager.setStageForUser(callback.from.id, Stages.VOICE_TO_MP3)

        await showVoiceToMp3Menu(callback.from.id)

        await bot.answerCallbackQuery(callback.id)

        logger.log(
            LogLevels.INFO,
            `Click '${Stages.VOICE_TO_MP3}' from start menu`,
            `USER: ${JSON.stringify(callback.from, null, 4)}`,
            processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
        )
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            `Click '${Stages.VOICE_TO_MP3}' from start menu`,
            `USER: ${JSON.stringify(callback.from, null, 4)}\nnERROR: ${JSON.stringify(err, null, 4)}`,
            0,
        )
    }
})

// if user send voice message and exists in the stage
bot.on('voice', async (msg: Message) => {
    try {
        if (msg.voice && msg.from && stageManager.isUserInStage(msg.from.id, Stages.VOICE_TO_MP3)) {
            const processTime = new Date()
            await findOrCreateUser(mapUser(msg.from))
            await bot.sendChatAction(msg.from.id, 'upload_voice')

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

            logger.log(
                LogLevels.INFO,
                `Send file in '${Stages.VOICE_TO_MP3}' menu\n`,
                `USER: ${JSON.stringify(msg.from, null, 4)}`,
                processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
            )
        }
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            `Send file in '${Stages.VOICE_TO_MP3}' menu\n`,
            `USER: ${JSON.stringify(msg.from, null, 4)}\nERROR: ${JSON.stringify(err, null, 4)}`,
            0,
        )
    }
})
