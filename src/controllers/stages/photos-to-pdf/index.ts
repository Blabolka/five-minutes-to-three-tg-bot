import bot from '@bot'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import { getConvertMenu } from '@controllers/menus/photos-to-pdf'

const trackedUsers: number[] = []
const fileIds: string[] = []

bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== 'photos-to-pdf') return
        // TODO 'add if not exists'
        trackedUsers.push(callback.from.id)

        await bot.editMessageText('‼ Принимаются только фото без сжатия ‼\nПосле загрузки фотографий нажмите "Конвертировать"', {
            reply_markup: {
                inline_keyboard: getConvertMenu()
            },
            chat_id: callback.message?.chat.id,
            message_id: callback.message?.message_id,
        })

        await bot.answerCallbackQuery(callback.id)
    } catch (err) {
        console.log(err)
    }
})

bot.on('document', async (msg: Message) => {
    try {
        if (msg.from && trackedUsers.includes(msg.from.id) && msg.document) {
            if (!msg.document || (msg.document.mime_type !== 'image/jpeg' && msg.document.mime_type !== 'image/png')) {
                // send to user warning message...
            }

            const filePath = await bot.downloadFile(msg.document.file_id, './files')

            const doc = new PDFDocument({
                margins: {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                }
            })
            const writeStream = fs.createWriteStream('./files/test.pdf')
            doc.pipe(writeStream)

            doc.image(filePath)

            doc.end()

            writeStream.on('finish', async () => {
                if (msg.from) {
                    await bot.sendDocument(msg.from.id, fs.createReadStream('./files/test.pdf'))
                }
            });
        }
    } catch (err) {
        console.log(err)
    }
})

bot.on('callback_query', (callback: CallbackQuery) => {
    try {
        if (callback.data !== 'convert-photos-to-pdf') return
    } catch (err) {
        console.log(err)
    }
})
