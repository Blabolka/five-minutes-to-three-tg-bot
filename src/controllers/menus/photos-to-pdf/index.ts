import { KeyboardButton } from 'node-telegram-bot-api'

export function getConvertMenu(): KeyboardButton[][] {
    const doConvert: KeyboardButton = { text: 'Конвертировать' }

    return [[doConvert]]
}
