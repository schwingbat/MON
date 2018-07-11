const path = require('path')
const fs = require('fs')
const parse = require('./parser/parser')

const args = process.argv.slice(2)

if (args[0] && args[1]) {
  const json = JSON.stringify(parse(fs.readFileSync(args[0]).toString('utf8')), null, 2)
  fs.writeFileSync(args[1], json)
}