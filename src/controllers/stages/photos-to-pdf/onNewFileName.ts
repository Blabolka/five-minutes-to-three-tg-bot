import bot from '@bot'
import sanitize from 'sanitize-filename'
import { Message } from 'node-telegram-bot-api'
import stageManager from '@services/StageManager'
import { findOrCreateUser, mapUser } from '@utils/users'
import { PhotosToPdfConvertingInfo } from '@common/interfaces/PhotosToPdf'

// if user sent new output file name
bot.on('message', async (msg: Message) => {
    try {
        if (
            msg.from &&
            msg.text &&
            msg.text.length < 250 &&
            stageManager.isUserInStage(msg.from.id, 'photos-to-pdf') &&
            !msg.entities &&
            msg.text !== 'Конвертировать'
        ) {
            await findOrCreateUser(mapUser(msg.from))
            const userStageData: PhotosToPdfConvertingInfo = stageManager.getUserStageData(msg.from.id)

            // find user and change file name for him
            const sanitizedFileName: string = sanitize(msg.text)

            if (sanitizedFileName) {
                userStageData.outputFileName = sanitizedFileName
                stageManager.setStageForUser(msg.from.id, 'photos-to-pdf', userStageData)

                await bot.sendMessage(
                    msg.from.id,
                    'Имя исходного файла было успешно заменено ✅\n' +
                        'Новое имя файла: ' +
                        '<b>' +
                        sanitizedFileName +
                        '</b>',
                    {
                        parse_mode: 'HTML',
                    },
                )
            }
        }
    } catch (err) {
        console.log(err)
    }
})
