import axios from 'axios'
import fs from 'fs'
import { nanoid } from 'nanoid'
import { FileType } from '@interfaces/FileType'

const token: string = process.env.BOT_TOKEN || ''

export async function getFileInfo(fileId: string) {
    try {
        const fileInfo = await axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`)
        return fileInfo.data.result ? fileInfo.data.result : null
    } catch (err) {
        console.trace(err)
        return null
    }
}

/**
 * according to
 * https://stackoverflow.com/questions/66844275/how-can-i-download-mp4-file-from-https-link-with-redirect-in-node-js
 */
export async function downloadFile(fileTelegramPath: string, fileType: FileType): Promise<string> {
    return await axios({
        url: `https://api.telegram.org/file/bot${token}/${fileTelegramPath}`,
        method: 'GET',
        responseType: 'stream',
    }).then((response) => {
        return new Promise((resolve, reject) => {
            const fileDirectory = './files'
            if (!fs.existsSync(fileDirectory)) {
                fs.mkdirSync(fileDirectory)
            }

            const filePath = fileDirectory + '/' + nanoid() + '.' + fileType

            const file = fs.createWriteStream(filePath)
            response.data.pipe(file)

            file.on('error', () => {
                return reject('')
            })

            file.on('finish', () => {
                file.close()
            })

            file.on('close', () => {
                return resolve(filePath)
            })
        })
    })
}
