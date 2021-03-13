const HashTable = require('./HashTable')

const runAttend = () => {
  const video = document.getElementById('video')
  const params = window.location.href.split('/')
  const id = params[params.length - 1]
  loadModels()
  getImagesData(id).then((imagesData) => {
    document.getElementById('loading-overlay').classList.add('hidden')
    startVideo()
    video.addEventListener('play', async () => {
      displayDetectionResult(video, imagesData)
    })
  })
}

const loadModels = async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    // faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  ])
}

const getImagesData = async (id) => {
  const response = await fetch(`/api/attend/${id}`)
  return await response.json()
}
const startVideo = () => {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  )
}

const displayDetectionResult = async (videoElement, imagesData) => {
  const canvasElement = document.getElementById('overlay')
  const displaySize = { width: videoElement.width, height: videoElement.height }
  const labeledDescriptors = generateLabeledDescriptors(imagesData)
  const maxDescriptorDistance = 0.6
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, maxDescriptorDistance)
  faceapi.matchDimensions(canvasElement, displaySize)
  const attendanceHashTable = new HashTable()
  const maxOccurenceLength = 5
  let occurrence = []

  setInterval(async () => {
    const detection = await detectFaceCamera(videoElement)
    clearCanvas(canvasElement)
    if (detection) {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor)
      let currentBestMatchInTable = attendanceHashTable.search(bestMatch.label)
      if (bestMatch.label === 'unknown') return

      // algorithm to handle detected face. to avoid detected face being attended
      // with a different person, we verify it by checking if the detected face was
      // detected at a given amount.
      if (occurrence.length > maxOccurenceLength) {
        if (isAllEqual(occurrence)) {
          if (currentBestMatchInTable) {
            if (currentBestMatchInTable.value < bestMatch.distance) {
              attendanceHashTable.add(bestMatch.label, bestMatch.distance)
            }
          } else {
            attendanceHashTable.add(bestMatch.label, bestMatch.distance)
            generateRowTable(bestMatch)
          }
        }
        occurrence = []
      }

      const resizedDetection = faceapi.resizeResults(detection, displaySize)
      drawFaceDetectionBox(canvasElement, resizedDetection)
      drawDetectionNameLabel(canvasElement, displaySize, bestMatch.toString())
    }
  }, 300)
}

const generateLabeledDescriptors = (imagesData) => {
  let labeledDescriptors = []
  for (const imageData of imagesData) {
    labeledDescriptors.push(
      new faceapi.LabeledFaceDescriptors(imageData.label, [new Float32Array(imageData.descriptor)])
    )
  }
  return labeledDescriptors
}

const detectFaceCamera = async (videoElement) => {
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()

  return detection
}

const clearCanvas = (canvasElement) => {
  canvasElement.getContext('2d').clearRect(0, 0, canvasElement.width, canvasElement.height)
}

const isAllEqual = (arr) => arr.every((val) => val === arr[0])

const generateRowTable = (bestMatch) => {
  const attendanceTableElement = document.getElementById('attendance-table')
  const attendanceTableBody = document.getElementById('table-body')
  const rowElement = document.createElement('tr')
  const cellNumber = document.createElement('th')
  cellNumber.setAttribute('scope', 'row')
  const cellName = document.createElement('td')
  const cellAttendanceAt = document.createElement('td')
  cellNumber.textContent = attendanceTableElement.rows.length
  cellName.textContent = bestMatch.label
  cellAttendanceAt.textContent = new Date().toLocaleTimeString()
  rowElement.appendChild(cellNumber)
  rowElement.appendChild(cellName)
  rowElement.appendChild(cellAttendanceAt)
  attendanceTableBody.insertBefore(rowElement, attendanceTableBody.firstChild)
}

const drawFaceDetectionBox = (canvasElement, resizedDetection) => {
  const boxDrawOptions = {
    // label: 'Hello I am a box!',
    boxColor: '#FEA501',
    lineWidth: 2,
  }
  const drawBox = new faceapi.draw.DrawBox(resizedDetection.detection.box, boxDrawOptions)
  drawBox.draw(canvasElement)
}

const drawDetectionNameLabel = (canvasElement, displaySize, label) => {
  const anchor = { x: 24, y: displaySize.height - 90 }
  const labelDrawOptions = {
    anchorPosition: 'TOP_LEFT',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    fontSize: 24,
    fontColor: 'white',
    padding: 16,
  }
  const drawTextField = new faceapi.draw.DrawTextField([label], anchor, labelDrawOptions)
  drawTextField.draw(canvasElement)
}

runAttend()
