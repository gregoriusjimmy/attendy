import { uploadHandler } from './src/middleware/handleUploadFile'
import express from 'express'

import path from 'path'

const PORT = 3000

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const viewsDir = path.join(__dirname, '/client/views')
app.use(express.static(path.join(__dirname, 'client')))

app.get('/', (req, res) => res.sendFile(path.join(viewsDir, 'index.html')))

app.post('/upload-images', (req, res) => {
  uploadHandler(req, res)
  app.get('/scan', (req, res) => res.sendFile(path.join(viewsDir, 'test.html')))
  res.redirect('/scan')
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))
