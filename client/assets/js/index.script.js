function ekUpload() {
  function Init() {
    console.log('Upload Initialised')

    const fileSelect = document.getElementById('file-upload'),
      fileDrag = document.getElementById('file-drag')
    // submitButton = document.getElementById('submit-button')

    fileSelect.addEventListener('change', fileSelectHandler, false)

    // Is XHR2 available?
    const xhr = new XMLHttpRequest()
    if (xhr.upload) {
      // File Drop
      fileDrag.addEventListener('dragover', fileDragHover, false)
      fileDrag.addEventListener('dragleave', fileDragHover, false)
      fileDrag.addEventListener('drop', fileSelectHandler, false)
    }
  }

  function fileDragHover(e) {
    const fileDrag = document.getElementById('file-drag')

    e.stopPropagation()
    e.preventDefault()

    fileDrag.className = e.type === 'dragover' ? 'hover' : 'modal-body file-upload'
  }

  function fileSelectHandler(e) {
    // Fetch FileList object
    const files = e.target.files || e.dataTransfer.files

    // Cancel event and hover styling
    fileDragHover(e)
    // Process all File objects

    parseFile(files)
    // uploadFile(f)
  }

  function parseFile(files) {
    const isFilesVerified = verifyFiles(files)
    controlResponseDisplay(isFilesVerified)
    if (isFilesVerified) displayThumbnails(files)
  }

  function verifyFiles(files) {
    let isFilesVerified = true
    for (let i = 0; i < files.length; i++) {
      const isImage = /\.(?=gif|jpg|png|jpeg)/gi.test(files[i].name)
      if (!isImage) {
        isFilesVerified = false
        return isFilesVerified
      }
    }
    return isFilesVerified
  }

  function controlResponseDisplay(isFilesVerified) {
    if (isFilesVerified) {
      document.getElementById('start').classList.add('hidden')
      document.getElementById('images-preview').classList.remove('hidden')
      document.getElementById('notimage').classList.add('hidden')

      // document.getElementById('file-image').classList.remove('hidden')
      // document.getElementById('file-image').src = URL.createObjectURL(file)
      // output('<strong>' + encodeURI(file.name) + '</strong>')
    } else {
      // document.getElementById('file-image').classList.add('hidden')
      document.getElementById('notimage').classList.remove('hidden')
      document.getElementById('start').classList.remove('hidden')
      document.getElementById('images-preview').classList.add('hidden')
      document.getElementById('file-upload-form').reset()
    }
  }

  function displayThumbnails(files) {
    for (let i = 0; i < files.length; i++) {
      const thumbnailContainerElement = document.createElement('div')
      thumbnailContainerElement.classList.add('thumbnail-container')

      const imageNameElement = document.createElement('p')
      imageNameElement.classList.add('image-name')
      const imgNameText = document.createTextNode(files[i].name)
      imageNameElement.appendChild(imgNameText)

      const imageElement = document.createElement('img')
      imageElement.classList.add('image-thumbnail')
      imageElement.src = URL.createObjectURL(files[i])

      thumbnailContainerElement.appendChild(imageElement)
      thumbnailContainerElement.appendChild(imageNameElement)

      document.getElementById('images-preview').appendChild(thumbnailContainerElement)
    }
  }

  // var fileType = file.type;
  // console.log(fileType);

  // function setProgressMaxValue(e) {
  //   var pBar = document.getElementById('file-progress')

  //   if (e.lengthComputable) {
  //     pBar.max = e.total
  //   }
  // }

  // function updateFileProgress(e) {
  //   var pBar = document.getElementById('file-progress')

  //   if (e.lengthComputable) {
  //     pBar.value = e.loaded
  //   }
  // }

  // function uploadFile(file) {
  //   var xhr = new XMLHttpRequest(),
  //     fileInput = document.getElementById('class-roster-file'),
  //     pBar = document.getElementById('file-progress'),
  //     fileSizeLimit = 1024 // In MB
  //   if (xhr.upload) {
  //     // Check if file is less than x MB
  //     if (file.size <= fileSizeLimit * 1024 * 1024) {
  //       // Progress bar
  //       pBar.style.display = 'inline'
  //       xhr.upload.addEventListener('loadstart', setProgressMaxValue, false)
  //       xhr.upload.addEventListener('progress', updateFileProgress, false)

  //       // File received / failed
  //       xhr.onreadystatechange = function (e) {
  //         if (xhr.readyState == 4) {
  //           // Everything is good!
  //           // progress.className = (xhr.status == 200 ? "success" : "failure");
  //           // document.location.reload(true);
  //         }
  //       }

  //       // Start upload
  //       xhr.open('POST', document.getElementById('file-upload-form').action, true)
  //       xhr.setRequestHeader('X-File-Name', file.name)
  //       xhr.setRequestHeader('X-File-Size', file.size)
  //       xhr.setRequestHeader('Content-Type', 'multipart/form-data')
  //       xhr.send(file)
  //     } else {
  //       output('Please upload a smaller file (< ' + fileSizeLimit + ' MB).')
  //     }
  //   }
  // }

  // Check for the various File API support.
  if (window.File && window.FileList && window.FileReader) {
    Init()
  } else {
    document.getElementById('file-drag').style.display = 'none'
  }
}
ekUpload()
