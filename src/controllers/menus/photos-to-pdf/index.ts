import { InlineKeyboardButton } from 'node-telegram-bot-api'

export function getConvertMenu(): InlineKeyboardButton[][] {
    const doConvert: InlineKeyboardButton = { text: 'Конвертировать', callback_data: 'convert-photos-to-pdf' }

    return [[doConvert]]
}
