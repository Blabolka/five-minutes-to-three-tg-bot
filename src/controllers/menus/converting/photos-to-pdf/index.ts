import bot from '@bot'
import { BOT_TEXTS } from '@constants/texts'
import { MAX_MEGABYTES } from '@constants/photosToPdf'
import { KeyboardButton, Message } from 'node-telegram-bot-api'

export async function showPhotosToPdfConvertMenu(chatId: number): Promise<Message> {
    function getPhotosToPdfConvertKeyboard(): KeyboardButton[][] {
        const doConvert: KeyboardButton = { text: BOT_TEXTS.BOTTOM_MENU_CONVERT }

        return [[doConvert]]
    }

    return await bot.sendMessage(chatId, BOT_TEXTS.PHOTOS_TO_PDF_CONVERT_TEXT, {
        reply_markup: {
            keyboard: getPhotosToPdfConvertKeyboard(),
            resize_keyboard: true,
        },
    })
}

export async function showSizeLimitExceededMessage(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, `${BOT_TEXTS.MEMORY_LIMIT_EXCEEDED_MESSAGE} (${MAX_MEGABYTES} MB)`)
}

export async function showUnknownPhotoSizeMessage(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, BOT_TEXTS.UNKNOWN_PHOTO_LIMIT_MESSAGE)
}
