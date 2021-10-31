export enum LogLevels {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}
export interface SlackLoggerProps {
    slackLoggerEnabled: boolean
    slackAccessToken: string
    slackChannelId: string
}
