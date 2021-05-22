import { readdir } from 'fs/promises'
import path from 'path'
import * as faceapi from 'face-api.js'
import '@tensorflow/tfjs-node'

const canvas = require('canvas')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData } as any)

export interface UploadedImageData {
  label: string
  fileName: string
  descriptor: number[]
}

export const generateUploadedImagesData = async (dirPath: string): Promise<UploadedImageData[]> => {
  let uploadedImagesData: UploadedImageData[] = []
  try {
    await loadModels()
    uploadedImagesData = await proccessImages(dirPath)
  } catch (e) {
    console.error('error has occurred :', e)
  } finally {
    return uploadedImagesData
  }
}

const loadModels = async () => {
  const MODELS_LOCATION = path.join(__dirname, '..', '..', 'models')
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODELS_LOCATION)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_LOCATION)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_LOCATION)
}

const proccessImages = async (dirPath: string): Promise<UploadedImageData[]> => {
  let imagesData: UploadedImageData[] = []
  const files = await readdir(dirPath)
  for (const file of files) {
    const image = await canvas.loadImage(`${dirPath}/${file}`)
    const label = file.split('.')[0]

    const fullFaceDescription = await faceapi
      .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    // descriptor from faceapi return a Float32Array, we want to send the descriptor
    // to the client through json but json doesn't understrand Float32Array. So we
    // convert it to Array then convert it back to Float32Array in the client.
    imagesData.push({
      label: label,
      fileName: file,
      descriptor: Array.from(fullFaceDescription!.descriptor),
    })

  }
  return imagesData
}
