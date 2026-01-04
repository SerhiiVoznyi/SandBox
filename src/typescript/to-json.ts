export function toJson(obj: any): string {
  const seen = new WeakMap()

  function serialize(value: any): string {
    const type = typeof value

    if (value === null) return 'null'
    if (type === 'number' || type === 'boolean') return String(value)
    if (type === 'string') return `"${value.replace(/"/g, '\\"')}"`
    if (type === 'function' || type === 'undefined') return 'null'

    if (Array.isArray(value)) {
      const items = value.map((v) => serialize(v))
      return `[${items.join(',')}]`
    }

    if (type === 'object') {
      if (seen.has(value)) {
        return `"[Circular]"`
      }
      seen.set(value, true)

      const entries = Object.entries(value).map(([k, v]) => {
        const key = `"${k.replace(/"/g, '\\"')}"`
        return `${key}:${serialize(v)}`
      })

      return `{${entries.join(',')}}`
    }

    return 'null' // fallback
  }

  return serialize(obj)
}
