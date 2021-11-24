import bot from '@bot'
import { Stages } from '@interfaces/Stages'
import stageManager from '@services/StageManager'
import { findOrCreateUser, mapUser } from '@utils/users'
import { CallbackQuery } from 'node-telegram-bot-api'
import { showDeleteMetadataMenu } from '@controllers/menus/modification/delete-metadata'

// show user delete metadata menu
bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== Stages.DELETE_METADATA) return
        await findOrCreateUser(mapUser(callback.from))

        stageManager.setStageForUser(callback.from.id, Stages.DELETE_METADATA)

        await showDeleteMetadataMenu(callback.from.id)

        await bot.answerCallbackQuery(callback.id)
    } catch (err) {}
})

// // if user send file to remove metadata
// bot.on('document', async (msg: Message) => {
//     try {
//         if (msg && msg.from && msg.document) {
//             const dirPath: string = getUserFilesDirectory(msg.from)
//             const filePath: string = await bot.downloadFile(msg.document.file_id, dirPath)
//         }
//     } catch (err) {}
// })
