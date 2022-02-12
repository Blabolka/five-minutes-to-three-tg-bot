import bot from '@bot'
import logger from '@services/Logger'
import sanitize from 'sanitize-filename'
import { Stages } from '@interfaces/Stages'
import { LogLevels } from '@interfaces/Logger'
import { Message } from 'node-telegram-bot-api'
import stageManager from '@services/StageManager'
import { findOrCreateUser, mapUser } from '@utils/users'
import { PhotosToPdfConvertingInfo } from '@interfaces/PhotosToPdf'

// if user sent new output file name
bot.on('message', async (msg: Message) => {
    try {
        if (
            msg.from &&
            msg.text &&
            msg.text.length < 250 &&
            msg.text !== 'Конвертировать' &&
            stageManager.isUserInStage(msg.from.id, Stages.PHOTOS_TO_PDF) &&
            !msg.entities
        ) {
            const processTime = new Date()

            await findOrCreateUser(mapUser(msg.from))
            const userStageData: PhotosToPdfConvertingInfo = stageManager.getUserStageData(msg.from.id)

            // find user and change file name for him
            const sanitizedFileName: string = sanitize(msg.text)

            if (sanitizedFileName) {
                userStageData.outputFileName = sanitizedFileName
                stageManager.setStageForUser(msg.from.id, Stages.PHOTOS_TO_PDF, userStageData)

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
                    `Change filename in '${Stages.PHOTOS_TO_PDF}' menu. New filename is ${sanitizedFileName}`,
                    `USER: ${JSON.stringify(msg.from, null, 4)}`,
                    processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
                )
            } else {
                await bot.sendMessage(
                    msg.from.id,
                    '‼ Некорректное название файла.\n' + 'Имя файла не должно содержать следующих знаков: \\/:*?"<>|',
                )

                logger.log(
                    LogLevels.INFO,
                    `Change filename in '${Stages.PHOTOS_TO_PDF}' menu. Filename includes incorrect symbols`,
                    `USER: ${JSON.stringify(msg.from, null, 4)}`,
                    processTime.setTime(new Date().getTime() - processTime.getTime()) / 1000,
                )
            }
        }
    } catch (err) {
        logger.log(
            LogLevels.ERROR,
            `Change filename in '${Stages.PHOTOS_TO_PDF}' menu`,
            `USER: ${JSON.stringify(msg.from, null, 4)}\nERROR: ${JSON.stringify(err, null, 4)}`,
            0,
        )
    }
})
