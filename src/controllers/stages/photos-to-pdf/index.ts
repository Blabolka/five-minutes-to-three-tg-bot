import bot from '@bot'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import { getConvertMenu } from '@controllers/menus/photos-to-pdf'
import { UserFiles } from '@interfaces/UserFiles'

const userFiles: UserFiles[] = []

bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== 'photos-to-pdf') return

        const files: string[] | null = getUserSentFiles(callback.from.id)
        if (!files) {
            userFiles.push({ userId: callback.from.id, fileIds: [] })
        }

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
        if (msg.from && msg.document) {
            if (!msg.document || (msg.document.mime_type !== 'image/jpeg' && msg.document.mime_type !== 'image/png')) {
                // TODO send to user warning message...
                return
            }

            const files: string[] | null = getUserSentFiles(msg.from.id)

            if (files) {
                files.push(msg.document.file_id)
            }

        }
    } catch (err) {
        console.log(err)
    }
})

bot.on('callback_query', async (callback: CallbackQuery) => {
    try {
        if (callback.data !== 'convert-photos-to-pdf') return

        const files: string[] | null = getUserSentFiles(callback.from.id)
        if (!files || (files && !files.length)) {
            // TODO send to user warning message...
            return
        }

        // const dirPath: string = getUserFilesDirectory(callback.from)
        // const defaultMargins = { top: 0, left: 0, bottom: 0, right: 0 }
        //
        // const doc = new PDFDocument({ margins: defaultMargins })
        // const writeStream = fs.createWriteStream('./files/test.pdf')
        // doc.pipe(writeStream)
        //
        // for (const fileId of userFiles[index].fileIds) {
        //     doc.page.width = 100
        //     doc.page.height = 100
        //
        //     const filePath: string = await bot.downloadFile(fileId, dirPath)
        //     doc.image(filePath)
        // }
        //
        // doc.end()
        //
        // writeStream.on('finish', async () => {
        //     await bot.sendDocument(callback.from.id, fs.createReadStream('./files/test.pdf'))
        // });
        //
    } catch (err) {
        console.log(err)
    }
})

function getUserSentFiles(searchUserId: number): string[] | null {
    const files: UserFiles | undefined = userFiles.find(({ userId }: UserFiles) => {
        return userId === searchUserId
    })

    return files ? files.fileIds : null
}
