export interface PhotosToPdfConvertingInfo {
    userId: number
    fileIds: string[]
    filesSummarySize: number
    sizeLimitMessageWasShown: boolean
    outputFileName: string
    isConvertingInProcess: boolean
}
