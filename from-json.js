const MON = require('./mon/main.js')
const fs = require('fs')
const args = process.argv.slice(2)

if (args[0] && args[1]) {
  const obj = JSON.parse(fs.readFileSync(args[0]).toString('utf8'))
  fs.writeFileSync(args[1], MON.stringify(obj))
}