import bot from '@bot'
import { BOT_TEXTS } from '@constants/texts'
import { Message } from 'node-telegram-bot-api'

export async function showVideoNoteToMp4Menu(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, BOT_TEXTS.SEND_ROUND_VIDEO_TO_MP4_CONVERT)
}
