import bot from '@bot'
import { Message } from 'node-telegram-bot-api'

export async function showDeleteMetadataMenu(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, 'Отправьте файл для удаления метаданных из него')
}
