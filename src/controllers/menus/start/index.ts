import bot from '@bot'
import { Stages } from '@interfaces/Stages'
import { BOT_TEXTS } from '@constants/texts'
import { InlineKeyboardButton, Message } from 'node-telegram-bot-api'

export async function showStartMenu(chatId: number): Promise<Message> {
    await bot.sendMessage(chatId, BOT_TEXTS.WELCOME, {
        reply_markup: {
            remove_keyboard: true,
        },
    })
    return await bot.sendMessage(chatId, BOT_TEXTS.CHOOSE_CATEGORY, {
        reply_markup: {
            inline_keyboard: getStartMenuKeyboard(),
        },
    })
}

function getStartMenuKeyboard(): InlineKeyboardButton[][] {
    const convertingMenu: InlineKeyboardButton = { text: BOT_TEXTS.MENU_CONVERT, callback_data: Stages.CONVERTING_MENU }

    return [[convertingMenu]]
}
