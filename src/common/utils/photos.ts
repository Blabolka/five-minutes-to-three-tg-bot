import { imageSize } from 'image-size'
import { Dimensions } from '@interfaces/Photos'

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
                    orientation: dimensions.orientation || 1,
                })
            } else {
                reject(null)
            }
        })
    })
}
