import { WebClient } from '@slack/web-api'
import { SlackLoggerProps, LogLevels } from '@interfaces/Logger'

class Logger {
    readonly #slackLogger: WebClient
    readonly #slackLoggerProps: SlackLoggerProps

    constructor(slackLoggerProps: SlackLoggerProps) {
        this.#slackLoggerProps = slackLoggerProps
        this.#slackLogger = new WebClient(slackLoggerProps.slackAccessToken)
    }

    log(level: LogLevels, title: string, message: string, spentTimeInSeconds: number) {
        if (this.#slackLoggerProps.slackLoggerEnabled) {
            this.#logToSlack(level, title, message, spentTimeInSeconds)
        }
    }

    #logToSlack(level: LogLevels, title: string, message: string, spentTimeInSeconds: number) {
        const logLevelPrefix: string = `*[${level.toUpperCase()}]*`
        const logCompleteTitle: string = `${logLevelPrefix} ${title} (${spentTimeInSeconds} s)`
        const logMessage: string = `${logCompleteTitle}\n${message}`

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
}

const slackLoggerProps: SlackLoggerProps = {
    slackLoggerEnabled: process.env.SLACK_LOGGER_ENABLED === 'true' || false,
    slackAccessToken: process.env.SLACK_LOGGER_ACCESS_TOKEN || '',
    slackChannelId: process.env.SLACK_LOGGER_CHANNEL_ID || '',
}

const logger = new Logger(slackLoggerProps)

export default logger
