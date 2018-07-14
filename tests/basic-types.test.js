const MON = require('../mon/main.js')

describe('basic types', () => {
  it('parses numbers', () => {
    expect(MON.parse(`test 5\ntest2 6`)).toEqual({
      'test': 5,
      'test2': 6
    })

    expect(MON.parse(`decimal 5.23\n`)).toEqual({
      decimal: 5.23
    })
  })

  it('parses strings with one line', () => {
    expect(true).toBe(false)
  })

  it('parses strings with multiple lines', () => {
    expect(true).toBe(false)
  })

  it('parses objects', () => {
    expect(true).toBe(false)
  })

  it('parses arrays', () => {
    expect(true).toBe(false)
  })
})