import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_FOLDER = 'uploads'

export const uploadHandler = (req: Request, res: Response) => {
  let newDirName = getNewDirName()
  generateNewDir(newDirName).then((what) => console.log(what))
  const storage = generateStorage(newDirName)
  const upload = multer({ storage: storage, fileFilter: imageFilter }).array('multiple_images', 20)

  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      newDirName = ''
    } else if (err) {
      console.log(err)
      newDirName = ''
    }
    // const files = req.files
  })

  return newDirName
}

const getNewDirName = () => Date.now().toString()

const generateNewDir = async (dirName: string) => {
  try {
    await fs.promises.mkdir(path.join(__dirname, '..', '..', UPLOAD_FOLDER, dirName))
  } catch (error) {
    console.error('falied create dir:', error.message)
  }
}

const generateStorage = (newDirName: string): multer.StorageEngine => {
  return multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'uploads/' + newDirName)
    },
    // By default, multer removes file extensions so let's add them back
    filename: (req, file, callback) => {
      callback(null, file.originalname)
    },
  })
}

type callbackType = (error: Error | null, acceptFile: boolean) => void

const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: callbackType & multer.FileFilterCallback
) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    return callback(new Error('Only image files are allowed!'), false)
  }
  callback(null, true)
}
