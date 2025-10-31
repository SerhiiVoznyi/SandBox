/**
 * Strict JSON parser without using JSON.parse.
 * RFC 8259 compliant (no comments, no trailing commas, strict numbers).
 */
export function parseJson(input: string): any {
  let i = 0
  const s = input

  function error(msg: string): never {
    // compute line/col for nicer errors
    let line = 1,
      col = 1
    for (let k = 0; k < i; k++) {
      if (s.charCodeAt(k) === 10) {
        line++
        col = 1
      } else {
        col++
      }
    }
    throw new SyntaxError(`${msg} at ${line}:${col} (index ${i})`)
  }

  function peek(): string {
    return s[i]
  }
  function next(): string {
    return s[i++]
  }

  function skipWS(): void {
    while (i < s.length) {
      const c = s.charCodeAt(i)
      // space, tab, newline, carriage-return
      if (c === 32 || c === 9 || c === 10 || c === 13) i++
      else break
    }
  }

  function expect(ch: string): void {
    if (next() !== ch) error(`Expected '${ch}'`)
  }

  function parseValue(): any {
    skipWS()
    if (i >= s.length) error('Unexpected end of input')

    const c = peek()
    if (c === '"') return parseString()
    if (c === '-' || (c >= '0' && c <= '9')) return parseNumber()
    if (c === '{') return parseObject()
    if (c === '[') return parseArray()
    if (c === 't') return parseLiteral('true', true)
    if (c === 'f') return parseLiteral('false', false)
    if (c === 'n') return parseLiteral('null', null)

    error(`Unexpected character '${c}'`)
  }

  function parseLiteral(lit: 'true' | 'false' | 'null', val: any): any {
    for (let k = 0; k < lit.length; k++) {
      if (s[i + k] !== lit[k]) error(`Invalid literal, expected ${lit}`)
    }
    i += lit.length
    return val
  }

  function parseString(): string {
    expect('"')
    let out = ''
    while (i < s.length) {
      const ch = next()
      if (ch === '"') return out
      if (ch === '\\') {
        const esc = next()
        switch (esc) {
          case '"':
            out += '"'
            break
          case '\\':
            out += '\\'
            break
          case '/':
            out += '/'
            break
          case 'b':
            out += '\b'
            break
          case 'f':
            out += '\f'
            break
          case 'n':
            out += '\n'
            break
          case 'r':
            out += '\r'
            break
          case 't':
            out += '\t'
            break
          case 'u': {
            const cp = readHex4()
            // handle surrogate pairs
            if (cp >= 0xd800 && cp <= 0xdbff) {
              // high surrogate; expect \uXXXX for low surrogate
              if (s[i] === '\\' && s[i + 1] === 'u') {
                i += 2
                const low = readHex4()
                if (low >= 0xdc00 && low <= 0xdfff) {
                  const full = 0x10000 + ((cp - 0xd800) << 10) + (low - 0xdc00)
                  out += String.fromCodePoint(full)
                } else {
                  error('Invalid low surrogate in string escape')
                }
              } else {
                error('Missing low surrogate after high surrogate')
              }
            } else {
              out += String.fromCharCode(cp)
            }
            break
          }
          default:
            error(`Invalid escape '\\${esc}'`)
        }
      } else {
        const cc = ch.charCodeAt(0)
        if (cc < 0x20) error('Unescaped control character in string')
        out += ch
      }
    }
    error('Unterminated string')
  }

  function readHex4(): number {
    let val = 0
    for (let k = 0; k < 4; k++) {
      const ch = next()
      const code = ch.charCodeAt(0)
      let n = -1
      if (code >= 0x30 && code <= 0x39) n = code - 0x30 // 0-9
      else if (code >= 0x41 && code <= 0x46) n = code - 0x41 + 10 // A-F
      else if (code >= 0x61 && code <= 0x66) n = code - 0x61 + 10 // a-f
      else error('Invalid hex digit in \\u escape')
      val = (val << 4) | n
    }
    return val
  }

  function parseNumber(): number {
    const start = i

    // sign
    if (peek() === '-') i++

    // integer part
    if (peek() === '0') {
      i++
      // leading zero must not be followed by digit
      const p = peek()
      if (p >= '0' && p <= '9')
        error('Invalid number: leading zeros not allowed')
    } else {
      if (!(peek() >= '1' && peek() <= '9')) error('Invalid number')
      while (peek() >= '0' && peek() <= '9') i++
    }

    // fraction
    if (peek() === '.') {
      i++
      if (!(peek() >= '0' && peek() <= '9'))
        error('Invalid number: missing digit after decimal point')
      while (peek() >= '0' && peek() <= '9') i++
    }

    // exponent
    if (peek() === 'e' || peek() === 'E') {
      i++
      if (peek() === '+' || peek() === '-') i++
      if (!(peek() >= '0' && peek() <= '9'))
        error('Invalid number: missing exponent digits')
      while (peek() >= '0' && peek() <= '9') i++
    }

    const numStr = s.slice(start, i)
    // Use Number() to convert the validated numeric string (not JSON.parse)
    const num = Number(numStr)
    if (!Number.isFinite(num)) error('Invalid number value')
    return num
  }

  function parseArray(): any[] {
    expect('[')
    skipWS()
    const arr: any[] = []
    if (peek() === ']') {
      next()
      return arr
    }
    while (true) {
      const val = parseValue()
      arr.push(val)
      skipWS()
      const ch = next()
      if (ch === ']') return arr
      if (ch !== ',') error("Expected ',' or ']' in array")
      skipWS()
    }
  }

  function parseObject(): Record<string, any> {
    expect('{')
    skipWS()
    const obj: Record<string, any> = {}
    if (peek() === '}') {
      next()
      return obj
    }
    while (true) {
      if (peek() !== '"') error('Expected string key')
      const key = parseString()
      skipWS()
      expect(':')
      const val = parseValue()
      obj[key] = val
      skipWS()
      const ch = next()
      if (ch === '}') return obj
      if (ch !== ',') error("Expected ',' or '}' in object")
      skipWS()
    }
  }

  const result = parseValue()
  skipWS()
  if (i !== s.length) error('Extra input after valid JSON')
  return result
}
