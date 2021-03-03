const runAttend = () => {
  const video = document.getElementById('video')
  init()
  startVideo()
  video.addEventListener('play', async () => {
    displayDetectionResult(video)
  })
}

const init = () => {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  ]).then((res) => startVideo())
}

const startVideo = () => {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  )
}

const displayDetectionResult = async (videoElement) => {
  const canvasElement = document.getElementById('overlay')
  const displaySize = { width: video.width, height: video.height }
  const params = window.location.href.split('/')
  const id = params[params.length - 1]
  const imagesData = await getImagesData(id)
  const labeledDescriptors = generateLabeledDescriptors(imagesData)
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors)
  faceapi.matchDimensions(canvasElement, displaySize)

  setInterval(async () => {
    const detection = await detectFaceCamera(videoElement)
    clearCanvas(canvasElement)
    if (detection) {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor)
      const resizedDetection = faceapi.resizeResults(detection, displaySize)
      drawFaceDetectionBox(canvasElement, resizedDetection)
      drawDetectionNameLabel(canvasElement, displaySize, bestMatch.toString())
    }
  }, 300)
}
const getImagesData = async (id) => {
  const response = await fetch(`/api/attend/${id}`)
  return await response.json()
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
