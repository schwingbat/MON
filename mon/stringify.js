function indent(level) {
  let ind = ''
  for (let i = 0; i < level; i++) {
    ind += '  '
  }
  return ind
}

function write (obj, level = 0) {
  let str = ''

  if (Array.isArray(obj)) {
    str += '['
    if (obj.length > 0) { str += '\n' }
    obj.forEach(val => {
      str += indent(level + 1) + write(val, level + 1) + '\n'
    })
    str += ']'
  } else if (typeof obj === 'object') {
    let i = 0
    let length = Object.keys(obj).length
    if (level > 0) {
      str += '{'
      if (length > 0) { str += '\n' }
    }
    for (const key in obj) {
      str += indent(level) + key + ' ' + write(obj[key], level + 1)
      i++
      if (i < length) {
        str += '\n'
      }
    }
    if (level > 0) {
      if (length > 0) { str += '\n' }
      str += indent(level - 1) + '}'
    }
  } else if (typeof obj === 'string') {
    str += `\"${obj}\"`
  } else if (typeof obj === 'number') {
    str += obj
  } else {
    str += obj
  }
  
  return str
}

module.exports = function (object, config = {}) {
  return write(object)
}