/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/HashTable.js":
/*!**********************************!*\
  !*** ./src/scripts/HashTable.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nclass HashTable {\r\n  constructor(size = 271) {\r\n    this.keyMap = new Array(size)\r\n  }\r\n\r\n  _hash(key) {\r\n    let total = 0\r\n    let WEIRD_PRIME = 31\r\n    for (let i = 0; i < Math.min(key.length, 100); i++) {\r\n      let char = key[i]\r\n      let value = char.charCodeAt(0) - 96\r\n      total = (total * WEIRD_PRIME + value) % this.keyMap.length\r\n    }\r\n    return total\r\n  }\r\n  add(key, value) {\r\n    let index = this._hash(key)\r\n\r\n    if (!this.keyMap[index]) {\r\n      this.keyMap[index] = {}\r\n    }\r\n    this.keyMap[index] = { key, value: { ...value } }\r\n  }\r\n  delete(key) {\r\n    let index = this._hash(key)\r\n    if (this.keyMap[index]) this.keyMap[index] = null\r\n  }\r\n  search(key) {\r\n    let index = this._hash(key)\r\n    if (this.keyMap[index]) {\r\n      return this.keyMap[index]\r\n    }\r\n    return undefined\r\n  }\r\n  getKeys() {\r\n    let keysArr = []\r\n    for (let i = 0; i < this.keyMap.length; i++) {\r\n      if (this.keyMap[i]) {\r\n        keysArr.push(this.keyMap[i]['key'])\r\n      }\r\n    }\r\n    return keysArr\r\n  }\r\n  getValues() {\r\n    let valuesArr = []\r\n    for (let i = 0; i < this.keyMap.length; i++) {\r\n      if (this.keyMap[i]) {\r\n        valuesArr.push(this.keyMap[i]['value'])\r\n      }\r\n    }\r\n    return valuesArr\r\n  }\r\n  getTable() {\r\n    let table = []\r\n    for (let i = 0; i < this.keyMap.length; i++) {\r\n      if (this.keyMap[i]) {\r\n        table.push({\r\n          key: this.keyMap[i]['key'],\r\n          value: this.keyMap[i]['value'],\r\n        })\r\n      }\r\n    }\r\n    return table\r\n  }\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HashTable);\r\n\n\n//# sourceURL=webpack://face-absension/./src/scripts/HashTable.js?");

/***/ }),

/***/ "./src/scripts/attend.script.js":
/*!**************************************!*\
  !*** ./src/scripts/attend.script.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _HashTable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HashTable */ \"./src/scripts/HashTable.js\");\n/* harmony import */ var _sheet__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sheet */ \"./src/scripts/sheet.js\");\n\r\n\r\nconst runAttend = async () => {\r\n  const video = document.getElementById('video')\r\n  const params = window.location.href.split('/')\r\n  const id = params[params.length - 1]\r\n  await loadModels()\r\n  getImagesData(id).then((imagesData) => {\r\n    startVideo()\r\n    video.addEventListener('play', async () => {\r\n      displayDetectionResult(video, imagesData)\r\n    })\r\n    document.getElementById('loading-overlay').classList.add('hidden')\r\n  })\r\n}\r\n\r\nconst loadModels = async () => {\r\n  await Promise.all([\r\n    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),\r\n    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),\r\n    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),\r\n  ])\r\n}\r\n\r\nconst getImagesData = async (id) => {\r\n  const response = await fetch(`/api/attend/${id}`)\r\n  return await response.json()\r\n}\r\n\r\nconst startVideo = () => {\r\n  navigator.getUserMedia(\r\n    { video: {} },\r\n    (stream) => (video.srcObject = stream),\r\n    (err) => console.error(err)\r\n  )\r\n}\r\n\r\nconst displayDetectionResult = async (videoElement, imagesData) => {\r\n  const canvasElement = document.getElementById('overlay')\r\n  const displaySize = { width: videoElement.width, height: videoElement.height }\r\n  const labeledDescriptors = generateLabeledDescriptors(imagesData)\r\n  const maxDescriptorDistance = 0.6\r\n  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, maxDescriptorDistance)\r\n  faceapi.matchDimensions(canvasElement, displaySize)\r\n  const attendanceHashTable = new _HashTable__WEBPACK_IMPORTED_MODULE_0__.default()\r\n  const maxOccurenceLength = 5\r\n  let occurrence = []\r\n\r\n  const exportXlsxBtn = document.getElementById('export-to-xlsx-btn')\r\n  exportXlsxBtn.addEventListener('click', () => exportToXlsx(attendanceHashTable))\r\n\r\n  setInterval(async () => {\r\n    const detection = await detectFaceCamera(videoElement)\r\n    clearCanvas(canvasElement)\r\n    if (detection) {\r\n      const bestMatch = faceMatcher.findBestMatch(detection.descriptor)\r\n      let currentBestMatchInTable = attendanceHashTable.search(bestMatch.label)\r\n      if (bestMatch.label === 'unknown') return\r\n      occurrence.push(bestMatch.label)\r\n\r\n      // algorithm to handle detected face. to avoid detected face being attended\r\n      // with a different person, we verify it by checking if the detected face was\r\n      // detected at a given amount.\r\n      if (occurrence.length > maxOccurenceLength) {\r\n        if (isAllEqual(occurrence)) {\r\n          if (currentBestMatchInTable) {\r\n            if (currentBestMatchInTable.value < bestMatch.distance) {\r\n              attendanceHashTable.add(bestMatch.label, { distance: bestMatch.distance })\r\n            }\r\n          } else {\r\n            const attendTime = new Date().toLocaleTimeString([], { hour12: false })\r\n            attendanceHashTable.add(bestMatch.label, {\r\n              distance: bestMatch.distance,\r\n              time: attendTime,\r\n            })\r\n            generateRowTable(bestMatch, attendTime, attendanceHashTable)\r\n          }\r\n        }\r\n        occurrence = []\r\n      }\r\n\r\n      const resizedDetection = faceapi.resizeResults(detection, displaySize)\r\n      drawFaceDetectionBox(canvasElement, resizedDetection)\r\n      drawDetectionNameLabel(canvasElement, displaySize, bestMatch.toString())\r\n    }\r\n  }, 300)\r\n}\r\n\r\nconst generateLabeledDescriptors = (imagesData) => {\r\n  let labeledDescriptors = []\r\n  for (const imageData of imagesData) {\r\n    labeledDescriptors.push(\r\n      new faceapi.LabeledFaceDescriptors(imageData.label, [new Float32Array(imageData.descriptor)])\r\n    )\r\n  }\r\n  return labeledDescriptors\r\n}\r\n\r\nconst exportToXlsx = (attendanceHashTable) => {\r\n  const tableData = attendanceHashTable.getTable()\r\n  const convertedTableDataToObj = []\r\n  for (let i = 0; i < tableData.length; i++) {\r\n    convertedTableDataToObj.push({\r\n      Name: tableData[i]['key'],\r\n      'Attend at': tableData[i]['value'].time,\r\n    })\r\n  }\r\n  const workBook = (0,_sheet__WEBPACK_IMPORTED_MODULE_1__.generateSheet)(convertedTableDataToObj)\r\n  saveAs(new Blob([(0,_sheet__WEBPACK_IMPORTED_MODULE_1__.s2ab)(workBook)], { type: 'application/octet-stream' }), 'attend.xlsx')\r\n}\r\n\r\nconst detectFaceCamera = async (videoElement) => {\r\n  const detection = await faceapi\r\n    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())\r\n    .withFaceLandmarks()\r\n    .withFaceDescriptor()\r\n\r\n  return detection\r\n}\r\n\r\nconst clearCanvas = (canvasElement) => {\r\n  canvasElement.getContext('2d').clearRect(0, 0, canvasElement.width, canvasElement.height)\r\n}\r\n\r\nconst isAllEqual = (arr) => arr.every((val) => val === arr[0])\r\n\r\nconst generateRowTable = (bestMatch, attendTime, attendanceHashTable) => {\r\n  const attendanceTableElement = document.getElementById('attendance-table')\r\n  const attendanceTableBody = document.getElementById('table-body')\r\n  const rowElement = document.createElement('tr')\r\n  const cellNumber = document.createElement('th')\r\n  cellNumber.setAttribute('scope', 'row')\r\n  const cellName = document.createElement('td')\r\n  const cellAttendanceAt = document.createElement('td')\r\n  const cellActionBtn = document.createElement('td')\r\n  const deleteActionBtn = document.createElement('button')\r\n  const deleteIcon = document.createElement('i')\r\n\r\n  cellActionBtn.style = 'width: 10%'\r\n  deleteIcon.classList.add('fa', 'fa-trash')\r\n  deleteActionBtn.classList.add('delete-btn')\r\n  deleteActionBtn.appendChild(deleteIcon)\r\n  cellActionBtn.appendChild(deleteActionBtn)\r\n\r\n  cellNumber.textContent = attendanceTableElement.rows.length\r\n  cellName.textContent = bestMatch.label\r\n  cellAttendanceAt.textContent = attendTime\r\n\r\n  rowElement.appendChild(cellNumber)\r\n  rowElement.appendChild(cellName)\r\n  rowElement.appendChild(cellAttendanceAt)\r\n  rowElement.appendChild(cellActionBtn)\r\n  attendanceTableBody.insertBefore(rowElement, attendanceTableBody.firstChild)\r\n\r\n  deleteActionBtn.addEventListener('click', () => {\r\n    attendanceTableBody.removeChild(rowElement)\r\n    attendanceHashTable.delete(bestMatch.label)\r\n  })\r\n}\r\n\r\nconst drawFaceDetectionBox = (canvasElement, resizedDetection) => {\r\n  const boxDrawOptions = {\r\n    // label: 'Hello I am a box!',\r\n    boxColor: '#FEA501',\r\n    lineWidth: 2,\r\n  }\r\n  const drawBox = new faceapi.draw.DrawBox(resizedDetection.detection.box, boxDrawOptions)\r\n  drawBox.draw(canvasElement)\r\n}\r\n\r\nconst drawDetectionNameLabel = (canvasElement, displaySize, label) => {\r\n  const anchor = { x: 24, y: displaySize.height - 90 }\r\n  const labelDrawOptions = {\r\n    anchorPosition: 'TOP_LEFT',\r\n    backgroundColor: 'rgba(0, 0, 0, 0.5)',\r\n    fontSize: 24,\r\n    fontColor: 'white',\r\n    padding: 16,\r\n  }\r\n  const drawTextField = new faceapi.draw.DrawTextField([label], anchor, labelDrawOptions)\r\n  drawTextField.draw(canvasElement)\r\n}\r\n\r\nrunAttend()\r\n\n\n//# sourceURL=webpack://face-absension/./src/scripts/attend.script.js?");

/***/ }),

/***/ "./src/scripts/sheet.js":
/*!******************************!*\
  !*** ./src/scripts/sheet.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"generateSheet\": () => (/* binding */ generateSheet),\n/* harmony export */   \"s2ab\": () => (/* binding */ s2ab)\n/* harmony export */ });\nconst generateSheet = (data) => {\r\n  const workBook = XLSX.utils.book_new()\r\n  console.log(data)\r\n  workBook.Props = {\r\n    Title: '',\r\n    Author: 'Attendy',\r\n    CreatedDate: new Date(),\r\n  }\r\n\r\n  workBook.SheetNames.push('Attend')\r\n  const workSheet = XLSX.utils.json_to_sheet(data)\r\n  workBook.Sheets['Attend'] = workSheet\r\n  var wbout = XLSX.write(workBook, { bookType: 'xlsx', type: 'binary' })\r\n  return wbout\r\n}\r\n\r\nconst s2ab = (s) => {\r\n  var buf = new ArrayBuffer(s.length) //convert s to arrayBuffer\r\n  var view = new Uint8Array(buf) //create uint8array as viewer\r\n  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff //convert to octet\r\n  return buf\r\n}\r\n\n\n//# sourceURL=webpack://face-absension/./src/scripts/sheet.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/scripts/attend.script.js");
/******/ 	
/******/ })()
;