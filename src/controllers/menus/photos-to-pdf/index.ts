import { KeyboardButton, Message } from 'node-telegram-bot-api'
import bot from '@bot'

export async function showPhotosToPdfConvertMenu(chatId: number): Promise<Message> {
    function getPhotosToPdfConvertKeyboard(): KeyboardButton[][] {
        const doConvert: KeyboardButton = { text: 'Конвертировать' }

        return [[doConvert]]
    }

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

export async function showSizeLimitExceededMessage(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, '‼ Превышен предел суммарной памяти фотографий для конвертации (50 МБ)')
}

export async function showUnknownPhotoSizeMessage(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, '‼ Получено фото с неизвестным количеством занимаемой памяти')
}
