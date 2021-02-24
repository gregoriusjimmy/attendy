import { generateNewDir, getNewDirName, uploadHandler } from './src/middleware/handleUploadFile'
import express, { response } from 'express'

import path from 'path'
import { generateUploadedImagesData } from './src/utils'

const PORT = 3000

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const VIEWS_DIR = path.join(__dirname, '/client/views')
app.use(express.static(path.join(__dirname, 'client')))

app.get('/', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'index.html')))

app.get('/api/scan/:dirName', (req, res) => {
  const dirName = req.params['dirName']
  const pathToDir = path.join(__dirname, 'uploads', dirName)
  generateUploadedImagesData(pathToDir).then((data) => {
    console.log(data)
    res.json(data)
  })
})

app.get('/scan/:dirName', (req, res) => {
  const dirName = req.params['dirName']
  console.log(req.query)
  // TO DO : handle dirName not available
  app.use('/' + dirName, express.static(path.join(__dirname, 'uploads', dirName)))
  // res.sendFile(path.join(__dirname, 'uploads', req.params['dirName']))
  res.sendFile(path.join(VIEWS_DIR, 'test.html'))
})

app.post('/upload-images', (req, res) => {
  const newDirName = uploadHandler(req, res)
  console.log(newDirName, 'post')
  res.redirect(`/scan/${newDirName}`)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))
