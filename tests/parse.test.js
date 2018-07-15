const MON = require('../mon/main.js')

describe('MON.parse', () => {
  it('parses numbers', () => {
    expect(MON.parse(`test 5\ntest2 6`)).toEqual({
      test: 5,
      test2: 6
    })

    expect(MON.parse(`decimal 5.23\n`)).toEqual({
      decimal: 5.23
    })
  })

  it('parses strings with one line', () => {
    expect(MON.parse(`test "this is a string"`)).toEqual({
      test: 'this is a string'
    })
  })

  it('parses strings with multiple lines', () => {
    expect(MON.parse(`test "this is a string\nwith multiple\n      lines"`)).toEqual({
      test: 'this is a string\nwith multiple\n      lines'
    })
  })

  it('parses true/false booleans', () => {
    expect(MON.parse('is_true true')).toEqual({ is_true: true })

    expect(MON.parse(`test true,is_bool false`)).toEqual({
      test: true,
      is_bool: false
    })

    expect(MON.parse(`test true\nis_bool false`)).toEqual({
      test: true,
      is_bool: false
    })

    expect(MON.parse(`test true,\n   is_bool false`)).toEqual({
      test: true,
      is_bool: false
    })
  })

  it('parses on/off booleans', () => {
    expect(MON.parse(`test_on on,test_off off`)).toEqual({
      test_on: true,
      test_off: false
    })
  })

  it('parses objects', () => {
    expect(MON.parse(`
      object {
        five 5
        string "string",
        boolean off
      }
    `)).toEqual({
      object: {
        five: 5,
        string: 'string',
        boolean: false
      }
    })
  })

  it('parses objects recursively', () => {
    expect(MON.parse(`
      one {
        two {
          three {
            four "five"
          }
        }
      }
    `)).toEqual({
      one: {
        two: {
          three: {
            four: 'five'
          }
        }
      }
    })
  })

  it('parses arrays', () => {
    expect(MON.parse(`
      array [
        1
        2
        3
        "five"
      ]
    `)).toEqual({ array: [1, 2, 3, "five"] })
    expect(MON.parse('array [1, 2, 3, "five"]')).toEqual({ array: [1, 2, 3, "five"] })
  })

  it('handles space-separated arrays', () => {
    expect(MON.parse(`array ["six" "seven" "eight" "nine"]`)).toEqual({
      array: ["six", "seven", "eight", "nine"]
    })

    expect(MON.parse(`array [1 2 3 "five"]`)).toEqual({
      array: [1, 2, 3, "five"]
    })

    expect(MON.parse(`array [1 2 3]`)).toEqual({
      array: [1, 2, 3]
    })

    expect(MON.parse(`bools [true true false]`)).toEqual({
      bools: [true, true, false]
    })

    expect(MON.parse(`composite [[1 2] [3 [4 5]] { five "six" }]`)).toEqual({
      composite: [
        [1, 2],
        [3, [4, 5]],
        { five: 'six' }
      ]
    })
  })

  it('ignores comments', () => {
    expect(MON.parse(`
      # this is [a comment] and should, be 5ignoredfsdfsdf
      one 2
      three "four"
    `)).toEqual({
      one: 2,
      three: 'four'
    })
  })

  it('skips comments even inside of strings', () => {
    expect(MON.parse('this "is a string\n#with a comment\n, yeah?"')).toEqual({
      this: 'is a string\n, yeah?'
    })
  })

  it('links references', () => {
    expect(MON.parse(`
      top-level "string"

      thing {
        number 5
      }

      other {
        ref @thing/number
        ref2 @top-level
      }
    `)).toEqual({
      'top-level': 'string',
      thing: {
        number: 5
      },
      other: {
        ref: 5,
        ref2: 'string'
      }
    })
  })
})