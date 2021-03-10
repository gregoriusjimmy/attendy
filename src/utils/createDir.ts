import path from 'path'
import fs from 'fs'

const UPLOAD_FOLDER = 'uploads'

export const createDir = async (dirName: string) => {
  try {
    const dirPath = path.join(__dirname, '..', '..', UPLOAD_FOLDER, dirName)
    // console.log(await isDirExist(dirPath))
    // isDirExist(dirPath)
    if ((await isDirExist(dirPath)) === false) generateNewDir(dirPath)
  } catch (error) {
    console.error('falied create dir:', error.message)
  }
}

const isDirExist = async (dirPath: string): Promise<boolean> => {
  let isExist = true
  try {
    await fs.promises.access(dirPath)
  } catch (err) {
    isExist = false
  } finally {
    return isExist
  }
}

const generateNewDir = async (dirPath: string) => {
  await fs.promises.mkdir(dirPath)
}

export const generateNewDirName = () => Date.now().toString()
