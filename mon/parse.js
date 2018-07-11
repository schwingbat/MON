function indicesDebug (fn, state) {
  console.log(fn, {
    length: state.input.length,
    pos: state.pos,
    mark: state.mark,
    position: state.position,
    char: state.char,
    buffer: state.input.slice(state.mark, state.pos)
  })
}

function string (state) {
  while (state.pos < state.input.length) {
    switch (state.input[state.pos]) {
      case '"':
        let oldMark = state.mark
        state.mark = state.pos + 1
        return state.input.slice(oldMark, state.pos)
      default:
        break
    }
    state.pos += 1
  }
}

function number (state) {
  while (state.pos < state.input.length) {
    switch (state.input[state.pos]) {
      case '\n':
      case ',':
        let num = state.buffer
        state.mark = state.pos + 1
        return Number(num.replace(/_/g, '')) // Allow underscores for readability
      default:
        break
    }
    state.pos += 1
  }
}

function array (state) {
  let values = []

  while (state.pos < state.input.length) {
    switch (state.input[state.pos]) {
      case ']':
        if (state.buffer.trim() !== '') {
          // indicesDebug('end of array', state)
          state.pos = state.mark
          values.push(value(state))
          state.mark = state.pos + 1
        }
        return values
      case ' ':
      case '\t':
        state.mark = state.pos + 1
        break
      case '\n':
      case ',':
        if (state.buffer.trim() !== '') {
          // indicesDebug('array sep', state)
          state.pos = state.mark
          values.push(value(state))
          state.mark = state.pos + 1
        }
        break
    }
    state.pos += 1
  }
}

function object (state) {
  let parsed = {}

  while (state.pos < state.input.length) {
    // indicesDebug('object', state)
    switch (state.input[state.pos]) {
      case '}':
        state.pos += 1
        state.mark = state.pos + 1
        return parsed
      // case '\n':
      // case ',':
      //   // if (Object.keys(parsed).length === 0) {
      //   //   state.mark = state.pos + 1
      //   // }
      //   break;
      case ' ':
      case '\t':
        state.mark = state.pos + 1
        break;
      default:
        key(state, parsed)
        state.pos -= 1
        break
    }
    state.pos += 1
  }
}

function boolean (state) {
  function translate (buffer) {
    switch (buffer.trim().toLowerCase()) {
      case 'true':
      case 'on':
        state.mark = state.pos + 1
        return true
      case 'false':
      case 'off':
        state.mark = state.pos + 1
        return false
      default:
        throw new Error(`Unrecognized boolean value "${state.buffer.trim()}" at (${state.position})`)
    }
  }

  while (state.pos < state.input.length) {
    switch (state.input[state.pos]) {
      case '\n':
      case ',':
        return translate(state.buffer)
    }
    state.pos += 1
  }
  if (state.pos === state.input.length) {
    return translate(state.buffer)
  }
}

function reference (state) {
  let parts = []
  let value = state.parsed

  while (state.pos < state.input.length) {
    switch (state.input[state.pos]) {
      case '/':
        parts.push(state.buffer)
        state.mark = state.pos + 1
        value = value[parts[parts.length - 1]]
        break
      case '\n':
      case ',':
        parts.push(state.buffer)
        state.mark = state.pos + 1
        value = value[parts[parts.length - 1]]
        // TODO: Throw an error if reference doesn't exist
        return value === state.parsed
          ? null
          : value
      default:
        break
    }
    state.pos += 1
  }
}

function comment (state) {
  // Roll until the next line break.
  while (state.pos < state.input.length && state.input[state.pos] !== '\n') {
    state.pos += 1
  }
  // state.pos += 1
  state.mark = state.pos + 1
}

function key (state, obj) {
  if (!obj) {
    obj = state.parsed
  }

  while (state.pos < state.input.length) {
    // indicesDebug('key', state)
    switch (state.input[state.pos]) {
      case ' ':
      case '\t':
        // end of key
        let mark = state.mark
        state.pos += 1
        state.mark = state.pos
        const k = state.input.slice(mark, state.pos - 1)
        obj[k] = value(state)
        return
      case '#':
        comment(state)
        break
      case '\n':
      case ',':
        state.pos += 1
        state.mark = state.pos
        return
      default:
        break
    }
    state.pos += 1
  }
}

function value (state) {
  while (state.pos < state.input.length) {
    // indicesDebug('value', state)
    switch (state.input[state.pos]) {
      case '[':
        state.pos += 1
        state.mark = state.pos
        return array(state)
      case '{':
        state.pos += 1
        state.mark = state.pos
        return object(state)
      case '"':
        state.pos += 1
        state.mark = state.pos
        return string(state)
      case '@':
        state.pos += 1
        state.mark = state.pos
        return reference(state)
      case ' ':
      case '\t':
        state.pos += 1
        state.mark = state.pos
        break
      default:
        // indicesDebug('default', state)
        if (/\d/.test(state.input[state.pos])) {
          return number(state)
        } else {
          return boolean(state)
        }
    }
  }
}

module.exports = function (input) {
  let state = {
    pos: 0,
    mark: 0,
    input,
    parsed: {},
    get buffer () {
      return this.input.slice(this.mark, this.pos)
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

  while (state.pos < state.input.length) {
    key(state)
    state.pos += 1
  }

  // console.log(state)

  return state.parsed
}