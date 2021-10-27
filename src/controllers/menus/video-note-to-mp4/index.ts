import bot from '@bot'
import { Message } from 'node-telegram-bot-api'

export async function showVideoNoteToMp4Menu(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, 'Отправьте круглое видео для конвертации в .mp4')
}
