import express from 'express'
import path from 'path'
import { generateUploadedImagesData } from './src/utils'
import { uploadHandler } from './src/middleware/handleUploadFile'

const PORT = 3000
const VIEWS_DIR = path.join(__dirname, '/client/views')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'client')))

app.get('/', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'index.html')))

app.get('/api/scan/:dirName', (req, res) => {
  const dirName = req.params['dirName']
  const pathToDir = path.join(__dirname, 'uploads', dirName)
  generateUploadedImagesData(pathToDir).then((data) => {
    console.log(data)
    // TO DO : Handle data
    res.json(data)
  })
})

app.get('/scan/:dirName', (req, res) => {
  const dirName = req.params['dirName']
  // TO DO : handle dirName not available
  app.use('/' + dirName, express.static(path.join(__dirname, 'uploads', dirName)))
  res.sendFile(path.join(VIEWS_DIR, 'test.html'))
})

app.post('/upload-images', (req, res) => {
  const newDirName = uploadHandler(req, res)
  // TO DO : handle 404 failed process
  res.redirect(`/scan/${newDirName}`)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))
