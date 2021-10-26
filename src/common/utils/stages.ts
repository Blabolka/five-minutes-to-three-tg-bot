import { MessageEntity } from 'node-telegram-bot-api'
import commands from '@common/commands.json'

export function isEntitiesIncludeSomeStage(entities: MessageEntity[], messageText: string): boolean {
    const containBotCommand: boolean = entities.some((item) => {
        return item.type === 'bot_command'
    })

    const containExistingBotCommand = containBotCommand
        ? commands.some((stage) => messageText.includes(stage.command))
        : false

    return containBotCommand && containExistingBotCommand
}
