import bot from '@bot'
import { Stages } from '@interfaces/Stages'
import { InlineKeyboardButton, Message } from 'node-telegram-bot-api'

export async function showConvertingMenu(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, 'Выберите нужную вам категорию:', {
        reply_markup: {
            inline_keyboard: getConvertingMenuKeyboard(),
        },
    })
}

function getConvertingMenuKeyboard(): InlineKeyboardButton[][] {
    const photosToPdfButton: InlineKeyboardButton = { text: 'Фото в .pdf', callback_data: Stages.PHOTOS_TO_PDF }
    const voiceMessageToMP3: InlineKeyboardButton = { text: 'Войсы в .mp3', callback_data: Stages.VOICE_TO_MP3 }
    const videoNoteToMP4: InlineKeyboardButton = { text: 'Кружки в .mp4', callback_data: Stages.VIDEO_NOTE_TO_MP4 }

    return [[photosToPdfButton], [voiceMessageToMP3], [videoNoteToMP4]]
}
