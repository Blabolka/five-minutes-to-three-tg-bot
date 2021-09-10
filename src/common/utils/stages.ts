import { MessageEntity } from 'node-telegram-bot-api'
import stages from '@common/stages.json'

export function isEntitiesIncludeSomeStage(entities: MessageEntity[], messageText: string): boolean {
    const containBotCommand: boolean = entities.some((item) => {
        return item.type === 'bot_command'
    })

    const containExistingBotCommand = containBotCommand
        ? stages.some((stage) => messageText.includes(stage.command))
        : false

    return containBotCommand && containExistingBotCommand
}
