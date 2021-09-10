import { InlineKeyboardButton, Message } from 'node-telegram-bot-api'
import bot from '@bot'

export async function showStartMenu(chatId: number): Promise<Message> {
    await bot.sendMessage(chatId, 'Добро пожаловать!', {
        reply_markup: {
            remove_keyboard: true,
        },
    })
    return await bot.sendMessage(chatId, 'Выберите нужную вам категорию.', {
        reply_markup: {
            inline_keyboard: getStartMenuKeyboard(),
        },
    })
}

function getStartMenuKeyboard(): InlineKeyboardButton[][] {
    const photosToPdfButton: InlineKeyboardButton = { text: 'Фото в .pdf', callback_data: 'photos-to-pdf' }

    return [[photosToPdfButton]]
}
