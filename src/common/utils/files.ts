import bot from '@bot'
import { Dimensions } from '@interfaces/Photos'
import sharp from 'sharp'
import { getPhotoSize } from '@utils/photos'
import path from 'path'
import fs from 'fs'

export async function downloadPhotosToPdf(fileIds: string[], dirPath: string): Promise<string[]> {
    const result: string[] = []

    for (const fileId of fileIds) {
        // creating new file with sizes that match pdf file
        // TODO sometimes download photo with rotation
        const photoFilePath: string = await bot.downloadFile(fileId, dirPath)
        const fileExtension = path.extname(photoFilePath)
        const newPhotoFilePath =
            photoFilePath.substring(0, photoFilePath.lastIndexOf(fileExtension)) + '-resized' + fileExtension

        const photoDimensions: Dimensions = matchPhotoSizeToPdf(await getPhotoSize(photoFilePath))

        if (fileExtension === '.jpg') {
            await sharp(photoFilePath)
                .jpeg({ quality: 100 })
                .resize(photoDimensions.width, photoDimensions.height)
                .toFile(newPhotoFilePath)
        } else {
            await sharp(photoFilePath)
                .png()
                .resize(photoDimensions.width, photoDimensions.height)
                .toFile(newPhotoFilePath)
        }

        // delete old photo file
        fs.unlinkSync(photoFilePath)

        result.push(newPhotoFilePath)
    }

    return result
}

function matchPhotoSizeToPdf(photoSize: Dimensions): Dimensions {
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
