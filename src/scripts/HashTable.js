class HashTable {
  constructor(size = 271) {
    this.keyMap = new Array(size)
  }

  _hash(key) {
    let total = 0
    let WEIRD_PRIME = 31
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      let char = key[i]
      let value = char.charCodeAt(0) - 96
      total = (total * WEIRD_PRIME + value) % this.keyMap.length
    }
    return total
  }
  add(key, value) {
    let index = this._hash(key)

    if (!this.keyMap[index]) {
      this.keyMap[index] = {}
    }
    this.keyMap[index] = { key, value: { ...value } }
  }
  delete(key) {
    let index = this._hash(key)
    if (this.keyMap[index]) this.keyMap[index] = null
  }
  search(key) {
    let index = this._hash(key)
    if (this.keyMap[index]) {
      return this.keyMap[index]
    }
    return undefined
  }
  getKeys() {
    let keysArr = []
    for (let i = 0; i < this.keyMap.length; i++) {
      if (this.keyMap[i]) {
        keysArr.push(this.keyMap[i]['key'])
      }
    }
    return keysArr
  }
  getValues() {
    let valuesArr = []
    for (let i = 0; i < this.keyMap.length; i++) {
      if (this.keyMap[i]) {
        valuesArr.push(this.keyMap[i]['value'])
      }
    }
    return valuesArr
  }
  getTable() {
    let table = []
    for (let i = 0; i < this.keyMap.length; i++) {
      if (this.keyMap[i]) {
        table.push({
          key: this.keyMap[i]['key'],
          value: this.keyMap[i]['value'],
        })
      }
    }
    return table
  }
}

export default HashTable
