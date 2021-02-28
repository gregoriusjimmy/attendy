const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
]).then((res) => startVideo())

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  )
}

const getImagesData = async (id) => {
  const response = await fetch(`/api/scan/${id}`)
  return await response.json()
}

video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  const params = window.location.href.split('/')
  const id = params[params.length - 1]
  const imagesData = await getImagesData(id)

  let labeledDescriptors = []

  for (const imageData of imagesData) {
    labeledDescriptors.push(
      new faceapi.LabeledFaceDescriptors(imageData.label, [new Float32Array(imageData.descriptor)])
    )
  }

  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors)
  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (detections) {
      const bestMatch = faceMatcher.findBestMatch(detections.descriptor)
      console.log(bestMatch.toString())
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

      // see DrawBoxOptions below
      const boxDrawOptions = {
        // label: 'Hello I am a box!',
        lineWidth: 2,
      }
      // faceapi.draw.drawDetections(canvas, resizedDetections)
      const drawBox = new faceapi.draw.DrawBox(resizedDetections.detection.box, boxDrawOptions)
      drawBox.draw(canvas)
      // console.log(detections)
      const text = [bestMatch.toString()]
      const anchor = { x: displaySize.width / 2 - 200, y: displaySize.height - 100 }
      // see DrawTextField below
      const labelDrawOptions = {
        anchorPosition: 'TOP_LEFT',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        fontSize: 32,
        fontColor: 'white',
        padding: 16,
      }
      const drawTextField = new faceapi.draw.DrawTextField(text, anchor, labelDrawOptions)
      drawTextField.draw(canvas)
    }
  }, 300)
})
