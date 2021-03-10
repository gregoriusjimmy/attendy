import express from 'express'
import path from 'path'
import { generateUploadedImagesData } from './src/utils/generateUploadedImagesData'
import { uploadHandler } from './src/middleware/handleUploadFile'
import { createDir, generateNewDirName } from './src/utils/createDir'

const PORT = 3000
const VIEWS_DIR = path.join(__dirname, '/client/views')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'client')))
app.use('/models', express.static(path.join(__dirname, 'models')))

app.get('/', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'index.html')))

app.get('/api/attend/:dirName', (req, res) => {
  const dirName = req.params['dirName']
  const pathToDir = path.join(__dirname, 'uploads', dirName)
  generateUploadedImagesData(pathToDir).then((data) => {
    // TO DO : Handle data
    res.json(data)
  })
})

app.get('/attend/:dirName', (req, res) => {
  const dirName = req.params['dirName']
  // TO DO : handle dirName not available
  app.use('/' + dirName, express.static(path.join(__dirname, 'uploads', dirName)))
  res.sendFile(path.join(VIEWS_DIR, 'attend.html'))
})

app.get('/api/getDirName', (req, res) => {
  const dirName = generateNewDirName()
  res.json(dirName)
})

app.post('/upload-images/:dirName', async (req, res) => {
  const dirName = req.params['dirName']
  await createDir(dirName)
  uploadHandler(req, res, dirName)
  // TO DO : handle 404 failed process
  res.status(200).end()
  // res.redirect(`/attend/${dirName}`)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))
