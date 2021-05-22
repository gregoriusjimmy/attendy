Dropzone.autoDiscover = false

const getDropzoneOptions = (dirName) => {
  return (options = {
    paramName: 'fileUpload',
    maxFilesize: 3, // MB,
    url: '/upload-images/' + dirName,
    timeout: 50000,
    accept: function (file, done) {
      const isImage = /\.(?=gif|jpg|png|jpeg)/gi.test(file.name)
      if (isImage) {
        showAttendBtn()
        done()
      } else {
        done('file is not image')
      }
    },
  })
}

showAttendBtn = () => {
  const attendBtn = document.getElementById('redirect')
  attendBtn.classList.remove('hidden')
}

fetchGetDirName = async () => {
  const url = 'http://localhost:3000/api/getDirName'
  const response = await fetch(url)
  return response.json()
}

const init = async () => {
  const dirName = await fetchGetDirName()
  new Dropzone('#my-awesome-dropzone', getDropzoneOptions(dirName))
  const linkEl = document.getElementById('redirect')
  linkEl.setAttribute('href', '/attend/' + dirName)
}

init()
