export const generateSheet = (data) => {
  const workBook = XLSX.utils.book_new()
  console.log(data)
  workBook.Props = {
    Title: '',
    Author: 'Attendy',
    CreatedDate: new Date(),
  }

  workBook.SheetNames.push('Attend')
  const workSheet = XLSX.utils.json_to_sheet(data)
  workBook.Sheets['Attend'] = workSheet
  var wbout = XLSX.write(workBook, { bookType: 'xlsx', type: 'binary' })
  return wbout
}

export const s2ab = (s) => {
  var buf = new ArrayBuffer(s.length) //convert s to arrayBuffer
  var view = new Uint8Array(buf) //create uint8array as viewer
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff //convert to octet
  return buf
}
