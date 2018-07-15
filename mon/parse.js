const DEBUG = true

function indicesDebug (fn, state) {
  if (DEBUG) {
    console.log(fn, {
      length: state.input.length,
      pos: state.pos,
      mark: state.marker,
      position: state.position,
      char: state.char,
      tape: state.input.slice(Math.max(0, state.marker - 15), state.marker)
            + state.input.slice(state.marker, state.pos)
            + '_'
            + state.input.slice(state.pos + 1, Math.min(state.input.length, state.pos + 15)),
      buffer: state.input.slice(state.marker, state.pos)
    })
  }
}

const debug = DEBUG ? {
  log: console.log.bind(console)
} : {
  log: () => {}
}

function pointToErrorText (state, message) {
  const lines = state.input.split('\n')
  const [lineNum, colNum] = state.position.split(':').map(n => Number(n))
  let line = ''

  line += lineNum + '  ' + lines[lineNum - 1]
  line += '\n'.padEnd(colNum + 1 + lineNum.toString().length) + '^'

  return line
}

function skipUntil (state, regex) {
  while (state.pos < state.input.length) {
    if (regex.test(state.input[state.pos])) {
      return
    }
    state.pos += 1
  }
}

function skipUntilAfter (state, regex) {
  skipUntil(state, regex)
  if (regex.test(state.input[state.pos])) {
    state.pos++
  }
}

function skipWhile (state, regex) {
  while (state.pos < state.input.length) {
    if (!regex.test(state.input[state.pos])) {
      return
    }
    state.pos++
  }
}

function takeUntil (state, regex) {
  if (typeof regex === 'string') {
    regex = new RegExp(regex)
  }
  while (state.pos < state.input.length) {
    if (regex.test(state.input[state.pos])) {
      return state.buffer
    } else {
      state.pos++
    }
  }

  return state.buffer
}

function takeWhile (state, regex) {
  if (typeof regex === 'string') {
    regex = new RegExp(regex)
  }
  while (state.pos < state.input.length && regex.test(state.input[state.pos])) {
    state.pos += 1
  }
  return state.buffer
}

function string (state) {
  let val = takeUntil(state, /"/)
    .replace(/#.*?\n/, '') // Get rid of any comments
  state.mark()
  state.pos++

  // Normalize multiline indentation
  if (val.indexOf('\n') > -1) {
    let lines = val.split('\n').filter(l => l !== '')
    let spaces = lines[0].match(/^(\s+)/)
    let indent = spaces
      ? spaces[1].length
      : 0
  
    return lines.map(line => {
      let c = 0
      let l = line
      while (c < indent && l[0] === ' ') {
        l = l.slice(1)
        c++
      }
      return l
    }).join('\n')
  } else {
    return val
  } 
}

function number (state) {
  while (state.pos < state.input.length) {
    switch (state.input[state.pos]) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '.':
      case '_':
        break
      default:
        return Number(state.buffer.replace(/_/g, '')) // Allow underscores for readability
    }
    state.pos += 1
  }

  return Number(state.buffer.replace(/_/g, ''))
}

function array (state) {
  let values = []

  while (state.pos < state.input.length) {
    skipWhile(state, /[\s\t,]/)
    state.mark()

    if (state.input[state.pos] === '#') {
      skipUntil(state, /\n/)
      state.mark()
    }

    if (state.input[state.pos] === ']') {
      state.pos++
      return values
    } else {
      let val = value(state)
      if (val !== undefined) {
        values.push(val)
      }
    }
  }

  return values
}

function boolean (state) {
  function translate (buffer) {
    switch (buffer.trim().toLowerCase()) {
      case 'true':
      case 'on':
        state.marker = state.pos
        return true
      case 'false':
      case 'off':
        state.marker = state.pos
        return false
      default:
        console.log(pointToErrorText(state))
        throw new Error(`Unrecognized boolean value "${state.buffer}" at (${state.position})`)
    }
  }

  const val = takeWhile(state, /[a-z]/)
  return translate(val)
}

function reference (state) {
  let source = takeWhile(state, /[A-Za-z0-9/._-]/).split('/')
  state.mark()

  return {
    __is_ref: true,
    source,
    parent: null,
    key: null
  }
}

function object (state) {
  let parsed = {}
  const separator = /[\n\s\t,]/

  while (state.pos < state.input.length) {
    skipWhile(state, separator)
    state.mark()

    if (state.input[state.pos] === '}') {
      state.pos++
      state.mark()
      break
    } else if (state.input[state.pos] === '#') {
      skipUntil(state, /\n/)
    } else {
      const [k, v] = kvPair(state)
      if (v && v.__is_ref) {
        v.parent = parsed
        v.key = k
        state.refs.push(v)
      }
      parsed[k] = v
      state.pos += 1
    }
  }

  return parsed
}

function kvPair (state) {
  const separator = /[\n\s\t,]/

  const k = takeWhile(state, /[A-Za-z0-9_.-]/i).trim()
  state.mark()

  skipWhile(state, separator)
  state.mark()

  const v = value(state)
  state.mark()

  return [k, v]
}

function value (state) {
  // indicesDebug('start of value', state)

  while (state.pos < state.input.length) {
    switch (state.input[state.pos]) {
      case '[':
        state.pos += 1
        state.mark()
        return array(state)
      case '{':
        state.pos += 1
        state.mark()
        return object(state)
      case '"':
        state.pos += 1
        state.mark()
        return string(state)
      case '@':
        state.pos += 1
        state.mark()
        return reference(state)
      case '':
      case ' ':
      case '\t':
        state.pos += 1
        state.mark()
        break
      case '\n':
        state.pos += 1
        state.mark()
        return
      default:
        if (/\d+(\.\d+)?/.test(state.input[state.pos])) {
          state.mark()
          // indicesDebug('number', state)
          return number(state)
        } else {
          state.mark()
          // indicesDebug('boolean', state)
          return boolean(state)
        }
    }
  }

  // indicesDebug('endOfValue', state)
}

function dereference (state, ref) {
  let val = state.parsed

  ref.source.forEach(key => {
    if (val[key]) {
      val = val[key]
    } else {
      // Throw an error because the path doesn't exist.
    }
  })

  ref.parent[ref.key] = val
}

module.exports = function (input) {
  let state = {
    pos: 0,
    marker: 0,
    input,
    refs: [],
    mark: function (offset = 0) {
      this.marker = this.pos + offset
    },
    get buffer () {
      return this.input.slice(this.marker, this.pos)
    },
    get char () {
      return this.input[this.pos]
    },
    get position () {
      let line = 1
      let pos = 1
      for (let i = 0; i < this.pos; i++) {
        if (this.input[i] === '\n') {
          line += 1
          pos = 1
        } else {
          pos += 1
        }
      }
      return line.toString() + ':' + pos.toString()
    }
  }

  /*
   * Start by parsing the file as an object.
   * An object contains a list of key-value pairs.
   * The parser will recursively figure out the rest.
   */

  state.parsed = object(state)

  // Resolve references

  state.refs.forEach(ref => dereference(state, ref))

  // console.log(state)

  return state.parsed
}