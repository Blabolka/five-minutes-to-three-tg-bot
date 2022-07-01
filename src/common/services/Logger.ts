import { WebClient } from '@slack/web-api'
import { LogLevels, LogMessageParams, SlackLoggerProps, ConsoleLoggerProps } from '@interfaces/Logger'

class Logger {
    readonly #slackLogger: WebClient
    readonly #slackLoggerProps: SlackLoggerProps
    readonly #consoleLoggerProps: ConsoleLoggerProps

    constructor(slackLoggerProps: SlackLoggerProps, consoleLoggerProps: ConsoleLoggerProps) {
        this.#slackLoggerProps = slackLoggerProps
        this.#consoleLoggerProps = consoleLoggerProps
        this.#slackLogger = new WebClient(slackLoggerProps.slackAccessToken)
    }

    log(level: LogLevels, title: string, message: string, spentTimeInSeconds: number) {
        if (this.#consoleLoggerProps.consoleLoggerEnabled) {
            const logMessage = Logger.#getLogMessage(level, title, message, spentTimeInSeconds, {
                levelPrefixStyle: 'simple',
            })
            Logger.#logToConsole(logMessage)
        }
        if (this.#slackLoggerProps.slackLoggerEnabled) {
            const logMessage = Logger.#getLogMessage(level, title, message, spentTimeInSeconds, {
                levelPrefixStyle: 'markdown',
            })
            this.#logToSlack(logMessage)
        }
    }

    static #logToConsole(logMessage: string) {
        console.log(logMessage)
    }

    #logToSlack(logMessage: string) {
        // because of max message length is 30000 characters
        for (let i = 0; i < Math.ceil(logMessage.length / 30000); i++) {
            this.#slackLogger.chat
                .postMessage({
                    channel: this.#slackLoggerProps.slackChannelId,
                    text: logMessage.substring(i * 30000, (i + 1) * 30000),
                    mrkdwn: true,
                })
                .then()
        }
    }

    static #getLogMessage(
        level: LogLevels,
        title: string,
        message: string,
        spentTimeInSeconds: number,
        messageParams: LogMessageParams,
    ): string {
        const logLevelPrefix: string =
            messageParams.levelPrefixStyle === 'markdown' ? `*[${level.toUpperCase()}]*` : `[${level.toUpperCase()}]`
        const logCompleteTitle: string = `${logLevelPrefix} ${title} (${spentTimeInSeconds} s)`
        return `${logCompleteTitle}\n${message}`
    }
}

const slackLoggerProps: SlackLoggerProps = {
    slackLoggerEnabled: process.env.SLACK_LOGGER_ENABLED === 'true' || false,
    slackAccessToken: process.env.SLACK_LOGGER_ACCESS_TOKEN || '',
    slackChannelId: process.env.SLACK_LOGGER_CHANNEL_ID || '',
}
const consoleLoggerProps: ConsoleLoggerProps = {
    consoleLoggerEnabled: process.env.CONSOLE_LOGGER_ENABLED === 'true' || false,
}

const logger = new Logger(slackLoggerProps, consoleLoggerProps)

export default logger
