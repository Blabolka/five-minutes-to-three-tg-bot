import bot from '@bot'
import { Stages } from '@interfaces/Stages'
import { BOT_TEXTS } from '@constants/texts'
import { InlineKeyboardButton, Message } from 'node-telegram-bot-api'

export async function showConvertingMenu(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, BOT_TEXTS.CHOOSE_CATEGORY, {
        reply_markup: {
            inline_keyboard: getConvertingMenuKeyboard(),
        },
    })
}

function getConvertingMenuKeyboard(): InlineKeyboardButton[][] {
    const photosToPdfButton: InlineKeyboardButton = {
        text: BOT_TEXTS.MENU_PHOTO_TO_PDF,
        callback_data: Stages.PHOTOS_TO_PDF,
    }
    const voiceMessageToMP3: InlineKeyboardButton = {
        text: BOT_TEXTS.MENU_VOICE_TO_MP3,
        callback_data: Stages.VOICE_TO_MP3,
    }
    const videoNoteToMP4: InlineKeyboardButton = {
        text: BOT_TEXTS.MENU_ROUND_VIDEOS_TO_MP3,
        callback_data: Stages.VIDEO_NOTE_TO_MP4,
    }

    return [[photosToPdfButton], [voiceMessageToMP3], [videoNoteToMP4]]
}
