import { InlineKeyboardButton } from 'node-telegram-bot-api'

export function getStartMenu(): InlineKeyboardButton[][] {
    const photosToPdfButton: InlineKeyboardButton = { text: 'Фото в .pdf', callback_data: 'photos-to-pdf' }

    return [[photosToPdfButton]]
}