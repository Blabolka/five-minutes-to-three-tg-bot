import { PhotosToPdfConvertingInfo } from '@interfaces/PhotosToPdf'
import bot from '@bot'
import path from 'path'
import { Dimensions } from '@interfaces/Photos'
import { getPhotoSize } from '@utils/photos'
import sharp from 'sharp'
import fs from 'fs'
import { nanoid } from 'nanoid'

export async function downloadPhotosToPdf(fileIds: string[], dirPath: string): Promise<string[]> {
    const result: string[] = []

    for (const fileId of fileIds) {
        // creating new file with sizes that match pdf file
        const photoFilePath: string = await bot.downloadFile(fileId, dirPath)
        const fileExtension = path.extname(photoFilePath)
        const newPhotoFilePath = path.join(path.dirname(photoFilePath), nanoid()) + fileExtension

        const photoDimensions: Dimensions = await getPhotoSize(photoFilePath)

        const sharpPhoto = sharp(photoFilePath)

        // compress image size
        if (fileExtension === '.jpg') {
            sharpPhoto.jpeg({ quality: 95 })
        } else {
            sharpPhoto.png({ quality: 95 })
        }

        // addition rotate if need
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
    const maxDimensionValue = 900
    const maxPhotoSizeDimensionValue = photoSize.width > photoSize.height ? photoSize.width : photoSize.height

    const newPhotoSize: Dimensions = { ...photoSize }

    if (maxPhotoSizeDimensionValue > maxDimensionValue) {
        const differenceCoefficient: number = maxDimensionValue / maxPhotoSizeDimensionValue
        newPhotoSize.width = Math.round(newPhotoSize.width * differenceCoefficient)
        newPhotoSize.height = Math.round(newPhotoSize.height * differenceCoefficient)
    }

    return newPhotoSize
}

export function getIsConvertingInProcess(userFiles: PhotosToPdfConvertingInfo[], searchUserId: number): boolean {
    const userInfo: PhotosToPdfConvertingInfo | undefined = findUserConvertingInfo(userFiles, searchUserId)

    return userInfo ? userInfo.isConvertingInProcess : false
}

export function getUserSentFiles(userFiles: PhotosToPdfConvertingInfo[], searchUserId: number): string[] | null {
    const userInfo: PhotosToPdfConvertingInfo | undefined = findUserConvertingInfo(userFiles, searchUserId)

    return userInfo ? userInfo.fileIds : null
}

export function getUserSentOutputFileName(userFiles: PhotosToPdfConvertingInfo[], searchUserId: number): string | null {
    const userInfo: PhotosToPdfConvertingInfo | undefined = findUserConvertingInfo(userFiles, searchUserId)

    return userInfo ? userInfo.outputFileName : null
}

function findUserConvertingInfo(
    userFiles: PhotosToPdfConvertingInfo[],
    searchUserId: number,
): PhotosToPdfConvertingInfo | undefined {
    return userFiles.find(({ userId }: PhotosToPdfConvertingInfo) => {
        return userId === searchUserId
    })
}
