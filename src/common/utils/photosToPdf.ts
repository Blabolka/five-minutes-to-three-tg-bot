import fs from 'fs'
import bot from '@bot'
import path from 'path'
import sharp from 'sharp'
import { nanoid } from 'nanoid'
import { getPhotoSize } from '@utils/photos'
import { PhotosToPdfFileInfo } from '@interfaces/PhotosToPdf'
import { AllowedPhotoMimeTypes, Dimensions } from '@interfaces/Photos'

export function isIncorrectMimeType(mimeType: string = ''): boolean {
    const correctMimeTypes: string[] = Object.values(AllowedPhotoMimeTypes)
    return !correctMimeTypes.includes(mimeType)
}

interface DownloadPhotosToPdfCallbacks {
    onDownloadFileError?: (file: PhotosToPdfFileInfo, error) => void
}

export async function downloadPhotosToPdf(
    files: PhotosToPdfFileInfo[],
    dirPath: string,
    callbacks: DownloadPhotosToPdfCallbacks = {},
): Promise<string[]> {
    // safe download is need when image expired in time (was sent more than 1 hour ago)
    const safeDownloadFile = async (file: PhotosToPdfFileInfo, dirPath): Promise<string | undefined> => {
        try {
            return bot.downloadFile(file.fileId, dirPath)
        } catch (err) {
            if (callbacks.onDownloadFileError) {
                callbacks.onDownloadFileError(file, err)
            }
            return undefined
        }
    }

    const result: string[] = []

    for (const file of files) {
        const photoFilePath: string | undefined = await safeDownloadFile(file, dirPath)
        if (!photoFilePath) continue

        // creating new file with sizes that match pdf file
        const fileExtension = path.extname(photoFilePath)
        const newPhotoFilePath = path.join(path.dirname(photoFilePath), nanoid()) + fileExtension

        const photoDimensions: Dimensions = await getPhotoSize(photoFilePath)

        const sharpPhoto: sharp.Sharp = sharp(photoFilePath)
        compressImage(sharpPhoto, file.fileMimeType || '', fileExtension)

        // addition rotate if need
        await sharpPhoto.rotate(getRotationAngle(photoDimensions.orientation)).toFile(newPhotoFilePath)

        // delete old photo file
        fs.unlinkSync(photoFilePath)

        result.push(newPhotoFilePath)
    }

    return result
}

function compressImage(sharpPhoto: sharp.Sharp, fileMimeType: string, fileExtension: string) {
    const defaultQualityValue = 95
    switch (fileMimeType) {
        case AllowedPhotoMimeTypes.JPEG: {
            sharpPhoto.jpeg({ quality: defaultQualityValue })
            break
        }
        case AllowedPhotoMimeTypes.PNG: {
            sharpPhoto.png({ quality: defaultQualityValue })
            break
        }
        default: {
            if (fileExtension === '.jpg') {
                sharpPhoto.jpeg({ quality: defaultQualityValue })
            } else {
                sharpPhoto.png({ quality: defaultQualityValue })
            }
        }
    }
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
