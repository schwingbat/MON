const fs = require('fs')
const MON = require('./mon/main.js')
const util = require('util')

if (process.argv[2]) {
  const file = fs.readFileSync(process.argv[2]).toString('utf8')
  const parsed = MON.parse(file)
  console.log(util.inspect(parsed, {
    depth: Infinity,
    colors: true
  }))
}