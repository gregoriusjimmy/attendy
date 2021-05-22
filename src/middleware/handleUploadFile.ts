import { Request, Response } from 'express'
import multer from 'multer'

export const uploadHandler = (req: Request, res: Response, newDirName: string) => {
  const storage = generateStorage(newDirName)
  const upload = multer({ storage: storage, fileFilter: imageFilter }).single('fileUpload')

  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      console.error(err)
    } else if (err) {
      console.error(err)
    }
  })
}

const generateStorage = (newDirName: string): multer.StorageEngine => {
  return multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'uploads/' + newDirName)
    },

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
