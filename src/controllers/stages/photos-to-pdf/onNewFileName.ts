import bot from '@bot'
import logger from '@services/Logger'
import sanitize from 'sanitize-filename'
import { LogLevels } from '@interfaces/Logger'
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
            const processTime = new Date()

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

                logger.log(
                    LogLevels.INFO,
                    `Change filename in 'photos-to-pdf' menu. New filename is ${sanitizedFileName}`,
                    `USER: ${JSON.stringify(msg)}`,
                    processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
                )
            } else {
                await bot.sendMessage(
                    msg.from.id,
                    '‼ Некорректное название файла.\n' + 'Имя файла не должно содержать следующих знаков: \\/:*?"<>|',
                )

                logger.log(
                    LogLevels.INFO,
                    "Change filename in 'photos-to-pdf' menu. Filename includes incorrect symbols",
                    `USER: ${JSON.stringify(msg)}`,
                    processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
                )
            }
        }
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            "Change filename in 'photos-to-pdf' menu",
            `USER: ${JSON.stringify(msg)}\nERROR: ${JSON.stringify(err)}`,
            0,
        )
    }
})
