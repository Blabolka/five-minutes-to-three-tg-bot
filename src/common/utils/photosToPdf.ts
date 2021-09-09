import { ConvertingInfo } from '@interfaces/PhotosToPdf'
import bot from '@bot'
import path from 'path'
import { Dimensions } from '@interfaces/Photos'
import { getPhotoSize } from '@utils/photos'
import sharp from 'sharp'
import fs from 'fs'

export function getIsConvertingInProcess(userFiles: ConvertingInfo[], searchUserId: number): boolean {
    const userInfo: ConvertingInfo | undefined = findUserConvertingInfo(userFiles, searchUserId)

    return userInfo ? userInfo.isConvertingInProcess : false
}

export function getUserSentFiles(userFiles: ConvertingInfo[], searchUserId: number): string[] | null {
    const userInfo: ConvertingInfo | undefined = findUserConvertingInfo(userFiles, searchUserId)

    return userInfo ? userInfo.fileIds : null
}

export function getUserSentOutputFileName(userFiles: ConvertingInfo[], searchUserId: number): string | null {
    const userInfo: ConvertingInfo | undefined = findUserConvertingInfo(userFiles, searchUserId)

    return userInfo ? userInfo.outputFileName : null
}

function findUserConvertingInfo(userFiles: ConvertingInfo[], searchUserId: number): ConvertingInfo | undefined {
    return userFiles.find(({ userId }: ConvertingInfo) => {
        return userId === searchUserId
    })
}

export async function downloadPhotosToPdf(fileIds: string[], dirPath: string): Promise<string[]> {
    const result: string[] = []

    for (const fileId of fileIds) {
        // creating new file with sizes that match pdf file
        const photoFilePath: string = await bot.downloadFile(fileId, dirPath)
        const fileExtension = path.extname(photoFilePath)
        const newPhotoFilePath =
            photoFilePath.substring(0, photoFilePath.lastIndexOf(fileExtension)) + '-rotated' + fileExtension

        const photoDimensions: Dimensions = await getPhotoSize(photoFilePath)

        const sharpPhoto = sharp(photoFilePath)

        if (fileExtension === '.jpg') {
            sharpPhoto.jpeg({ quality: 100 })
        } else {
            sharpPhoto.png()
        }

        await sharpPhoto.rotate(getRotationAngle(photoDimensions.orientation)).toFile(newPhotoFilePath)

        // delete old photo file
        fs.unlinkSync(photoFilePath)

        result.push(newPhotoFilePath)
    }

    return result
}

function getRotationAngle(orientationExif: number): number {
    switch (orientationExif) {
        case 1:
            return 0
        case 3:
            return 180
        case 6:
            return 90
        case 8:
            return 270
        default:
            return 0
    }
}

export function matchPhotoSizeToPdf(photoSize: Dimensions): Dimensions {
    function shouldSwapWidthAndHeightValues(orientationExif: number): boolean {
        switch (orientationExif) {
            case 1:
                return false
            case 3:
                return false
            case 6:
                return true
            case 8:
                return true
            default:
                return false
        }
    }

    const maxDimensionValue = 900
    const maxPhotoSizeDimensionValue = photoSize.width > photoSize.height ? photoSize.width : photoSize.height

    const newPhotoSize: Dimensions = { ...photoSize }

    if (maxPhotoSizeDimensionValue > maxDimensionValue) {
        const differenceCoefficient: number = maxDimensionValue / maxPhotoSizeDimensionValue
        newPhotoSize.width = Math.round(newPhotoSize.width * differenceCoefficient)
        newPhotoSize.height = Math.round(newPhotoSize.height * differenceCoefficient)
    }

    if (shouldSwapWidthAndHeightValues(newPhotoSize.orientation)) {
        const temp = newPhotoSize.width
        newPhotoSize.width = newPhotoSize.height
        newPhotoSize.height = temp
    }

    return newPhotoSize
}
