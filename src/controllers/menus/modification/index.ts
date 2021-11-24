import bot from '@bot'
import { Stages } from '@interfaces/Stages'
import { InlineKeyboardButton, Message } from 'node-telegram-bot-api'

export async function showModificationMenu(chatId: number): Promise<Message> {
    return await bot.sendMessage(chatId, 'Выберите нужную вам категорию:', {
        reply_markup: {
            inline_keyboard: getModificationMenuKeyboard(),
        },
    })
}

function getModificationMenuKeyboard(): InlineKeyboardButton[][] {
    const deleteMetadataButton: InlineKeyboardButton = {
        text: 'Удаление метаданных',
        callback_data: Stages.DELETE_METADATA,
    }

    return [[deleteMetadataButton]]
}
