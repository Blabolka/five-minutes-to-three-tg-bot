import bot from '@bot'
import { Stages } from '@interfaces/Stages'
import { InlineKeyboardButton, Message } from 'node-telegram-bot-api'

export async function showStartMenu(chatId: number): Promise<Message> {
    await bot.sendMessage(chatId, 'Добро пожаловать!', {
        reply_markup: {
            remove_keyboard: true,
        },
    })
    return await bot.sendMessage(chatId, 'Выберите нужную вам категорию:', {
        reply_markup: {
            inline_keyboard: getStartMenuKeyboard(),
        },
    })
}

function getStartMenuKeyboard(): InlineKeyboardButton[][] {
    const convertingMenu: InlineKeyboardButton = { text: 'Конвертация', callback_data: Stages.CONVERTING_MENU }
    const modificationMenu: InlineKeyboardButton = { text: 'Модификация', callback_data: Stages.MODIFICATION_MENU }

    return [[convertingMenu], [modificationMenu]]
}
