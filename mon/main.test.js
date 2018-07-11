const fs = require('fs')
const path = require('path')
const parse = require('../main.js')
const examplePath = path.join(__dirname, '..', 'examples')

function loadExample(name) {
  return fs.readFileSync(path.join(examplePath, name), 'utf8')
}

console.log(examplePath)

describe('Basic key')