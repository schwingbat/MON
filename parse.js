const fs = require('fs')
const MON = require('./mon/main.js')
const util = require('util')

const bench = process.argv.includes('--benchmark')

if (process.argv[2]) {
  const file = fs.readFileSync(process.argv[2]).toString('utf8')
  if (bench) console.time('parse file')
  const parsed = MON.parse(file)
  if (bench) console.timeEnd('parse file')
  console.log(util.inspect(parsed, {
    depth: Infinity,
    colors: true
  }))
}