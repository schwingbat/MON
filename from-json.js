const MON = require('./mon/main.js')
const fs = require('fs')

if (process.argv[2]) {
  const obj = JSON.parse(fs.readFileSync(process.argv[2]).toString('utf8'))
  console.log(MON.stringify(obj))
}