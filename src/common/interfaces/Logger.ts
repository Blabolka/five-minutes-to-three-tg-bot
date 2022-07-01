export enum LogLevels {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}
export interface LogMessageParams {
    levelPrefixStyle: 'markdown' | 'simple'
}
export interface SlackLoggerProps {
    slackLoggerEnabled: boolean
    slackAccessToken: string
    slackChannelId: string
}
export interface ConsoleLoggerProps {
    consoleLoggerEnabled: boolean
}
