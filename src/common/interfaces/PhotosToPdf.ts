export interface PhotosToPdfFileInfo {
    fileId: string
    fileMimeType?: string
    fileSentTime: Date
}
export interface PhotosToPdfConvertingInfo {
    files: PhotosToPdfFileInfo[]
    outputFileName: string
    filesSummarySize: number
    isConvertingInProcess: boolean
    sizeLimitMessageWasShown: boolean
}
