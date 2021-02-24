import { readdir } from 'fs/promises'

export interface UploadedImageData {
  label: string
  fileName: string
}

export const generateUploadedImagesData = async (
  dirPath: string
): Promise<UploadedImageData[] | undefined> => {
  console.log(dirPath)
  try {
    let uploadedImagesData: Array<UploadedImageData> = []
    const files = await readdir(dirPath)
    console.log(files)

    for await (const file of files) {
      uploadedImagesData.push({ label: file.split('.')[0], fileName: file })
    }
    return uploadedImagesData
  } catch (e) {
    console.error("We've thrown! Whoops!", e)
    return undefined
  }
}
