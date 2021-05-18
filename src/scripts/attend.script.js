import HashTable from './HashTable'
import { generateSheet, s2ab } from './sheet'
const runAttend = async () => {
  const video = document.getElementById('video')
  const params = window.location.href.split('/')
  const id = params[params.length - 1]
  await loadModels()
  getImagesData(id).then((imagesData) => {
    startVideo()
    video.addEventListener('play', async () => {
      displayDetectionResult(video, imagesData)
    })
    document.getElementById('loading-overlay').classList.add('hidden')
  })
}

const loadModels = async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
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

  const exportXlsxBtn = document.getElementById('export-to-xlsx-btn')
  exportXlsxBtn.addEventListener('click', () => exportToXlsx(attendanceHashTable))

  setInterval(async () => {
    const detection = await detectFaceCamera(videoElement)
    clearCanvas(canvasElement)
    if (detection) {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor)
      if (bestMatch.label === 'unknown') return
      occurrence.push(bestMatch.label)

      // algorithm to handle detected face. to avoid detected face being attended
      // with a different person, we verify it by checking if the detected face was
      // detected at a given amount.
      if (occurrence.length > maxOccurenceLength) {
        if (isAllEqual(occurrence)) {
          const currentBestMatchInTable = attendanceHashTable.search(bestMatch.label)
          if (currentBestMatchInTable) {
            if (currentBestMatchInTable.value.distance > bestMatch.distance) {
              attendanceHashTable.add(bestMatch.label, {
                time: currentBestMatchInTable.value.time,
                distance: bestMatch.distance,
              })
            }
          } else {
            const attendTime = new Date().toLocaleTimeString([], {
              hour12: false,
            })
            attendanceHashTable.add(bestMatch.label, {
              time: attendTime,
              distance: bestMatch.distance,
            })
            generateRowTable(bestMatch, attendTime, attendanceHashTable)
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

const exportToXlsx = (attendanceHashTable) => {
  const tableData = attendanceHashTable.getTable()
  const convertedTableDataToObj = []
  for (let i = 0; i < tableData.length; i++) {
    convertedTableDataToObj.push({
      Name: tableData[i]['key'],
      'Attend at': tableData[i]['value'].time,
      Confidence: 1 - tableData[i]['value'].distance.toFixed(2),
    })
  }
  const currentDate = new Date()
  const formatedCurrentDate =
    currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear()
  const workBook = generateSheet(convertedTableDataToObj, formatedCurrentDate)
  saveAs(
    new Blob([s2ab(workBook)], { type: 'application/octet-stream' }),
    `Attendy-${formatedCurrentDate}.xlsx`
  )
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

const generateRowTable = (bestMatch, attendTime, attendanceHashTable) => {
  const attendanceTableElement = document.getElementById('attendance-table')
  const attendanceTableBody = document.getElementById('table-body')
  const rowElement = document.createElement('tr')
  const cellNumber = document.createElement('th')
  cellNumber.setAttribute('scope', 'row')
  const cellName = document.createElement('td')
  const cellAttendanceAt = document.createElement('td')
  const cellActionBtn = document.createElement('td')
  const deleteActionBtn = document.createElement('button')
  const deleteIcon = document.createElement('i')

  cellActionBtn.style = 'width: 10%'
  deleteIcon.classList.add('fa', 'fa-trash')
  deleteActionBtn.classList.add('delete-btn')
  deleteActionBtn.appendChild(deleteIcon)
  cellActionBtn.appendChild(deleteActionBtn)

  cellNumber.textContent = attendanceTableElement.rows.length
  cellName.textContent = bestMatch.label
  cellAttendanceAt.textContent = attendTime

  rowElement.appendChild(cellNumber)
  rowElement.appendChild(cellName)
  rowElement.appendChild(cellAttendanceAt)
  rowElement.appendChild(cellActionBtn)
  attendanceTableBody.insertBefore(rowElement, attendanceTableBody.firstChild)

  deleteActionBtn.addEventListener('click', () => {
    attendanceTableBody.removeChild(rowElement)
    attendanceHashTable.delete(bestMatch.label)
  })
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
