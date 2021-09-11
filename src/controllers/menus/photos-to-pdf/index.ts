import { KeyboardButton, Message } from 'node-telegram-bot-api'
import bot from '@bot'

export async function showPhotosToPdfConvertMenu(chatId: number): Promise<Message> {
    return await bot.sendMessage(
        chatId,
        'ℹ Имя исходного файла можно отправить сообщением\n' +
            'ℹ Можно отправить фото без сжатия для лучшего качества\n\n' +
            'После загрузки фотографий нажмите "Конвертировать"',
        {
            reply_markup: {
                keyboard: getPhotosToPdfConvertKeyboard(),
                resize_keyboard: true,
            },
        },
    )
}

function getPhotosToPdfConvertKeyboard(): KeyboardButton[][] {
    const doConvert: KeyboardButton = { text: 'Конвертировать' }

    return [[doConvert]]
}
