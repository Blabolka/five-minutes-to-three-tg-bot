import { Dimensions } from '@interfaces/Photos'
import { imageSize } from 'image-size'

export function getPhotoSize(filePath: string): Promise<Dimensions> {
    return new Promise((resolve, reject) => {
        imageSize(filePath, (err, dimensions) => {
            if (err) {
                console.log(err)
                reject(null)
            }

            if (dimensions && dimensions.width && dimensions.height) {
                resolve({
                    width: dimensions.width,
                    height: dimensions.height,
                })
            } else {
                reject(null)
            }
        })
    })
}
