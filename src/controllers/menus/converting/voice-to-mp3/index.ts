import bot from '@bot'
import { BOT_TEXTS } from '@constants/texts'
import { Message } from 'node-telegram-bot-api'

export async function showVoiceToMp3Menu(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, BOT_TEXTS.SEND_VOICE_TO_MP3_CONVERT)
}
