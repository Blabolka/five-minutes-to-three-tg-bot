import bot from '@bot'
import { Message } from 'node-telegram-bot-api'

export async function showVoiceToMp3Menu(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, 'Отправьте голосовое сообщения для конвертации в .mp3')
}
