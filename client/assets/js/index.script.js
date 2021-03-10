Dropzone.autoDiscover = false

const getDropzoneOptions = (dirName) => {
  return (options = {
    paramName: 'fileUpload',
    maxFilesize: 5, // MB,
    url: '/upload-images/' + dirName,
    accept: function (file, done) {
      const isImage = /\.(?=gif|jpg|png|jpeg)/gi.test(file.name)
      if (isImage) {
        done()
      } else {
        done('file is not image')
      }
    },
  })
}

fetchGetDirName = async () => {
  const url = 'http://localhost:3000/api/getDirName'
  const response = await fetch(url)
  return response.json()
}

const init = async () => {
  const dirName = await fetchGetDirName()
  new Dropzone('#my-awesome-dropzone', getDropzoneOptions(dirName))
  linkEl = document.getElementById('redirect')
  linkEl.setAttribute('href', '/attend/' + dirName)
}

init()
