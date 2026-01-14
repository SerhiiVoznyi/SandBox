import { ValidationError } from './validation-result'

export class PropertyRuleBuilder<T> {
  private optionalFlag = false
  private stopped = false

  constructor(
    private readonly property: string,
    private readonly value: T,
    private readonly addError: (e: ValidationError) => void
  ) {}

  /* ---------- flow control ---------- */

  optional(): this {
    this.optionalFlag = true
    return this
  }

  stopOnFirstFailure(): this {
    this.stopped = true
    return this
  }

  private fail(message: string, rule: string): void {
    if (this.stopped) return

    this.addError({
      property: this.property,
      message,
      rules: [rule],
    })
  }

  private isEmpty(): boolean {
    return this.value === undefined || this.value === null
  }

  /* ---------- rules ---------- */

  required(): this {
    if (this.isEmpty()) {
      this.fail('Value is required', 'required')
    }
    return this
  }

  string(): this {
    if (!this.isEmpty() && typeof this.value !== 'string') {
      this.fail('Must be a string', 'string')
    }
    return this
  }

  number(): this {
    if (!this.isEmpty() && typeof this.value !== 'number') {
      this.fail('Must be a number', 'number')
    }
    return this
  }

  int(): this {
    if (!this.isEmpty() && !Number.isInteger(this.value)) {
      this.fail('Must be an integer', 'int')
    }
    return this
  }

  min(min: number): this {
    if (typeof this.value === 'number' && this.value < min) {
      this.fail(`Minimum value is ${min}`, 'min')
    }
    return this
  }

  max(max: number): this {
    if (typeof this.value === 'number' && this.value > max) {
      this.fail(`Maximum value is ${max}`, 'max')
    }
    return this
  }

  minLength(min: number): this {
    if (typeof this.value === 'string' && this.value.length < min) {
      this.fail(`Minimum length is ${min}`, 'minLength')
    }
    return this
  }

  maxLength(max: number): this {
    if (typeof this.value === 'string' && this.value.length > max) {
      this.fail(`Maximum length is ${max}`, 'maxLength')
    }
    return this
  }

  email(): this {
    if (
      typeof this.value === 'string' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)
    ) {
      this.fail('Invalid email format', 'email')
    }
    return this
  }

  enum(values: readonly unknown[]): this {
    if (!this.isEmpty() && !values.includes(this.value)) {
      this.fail(`Value must be one of: ${values.join(', ')}`, 'enum')
    }
    return this
  }

  custom(
    ruleName: string,
    validator: (value: T) => boolean,
    message: string
  ): this {
    if (!validator(this.value)) {
      this.fail(message, ruleName)
    }
    return this
  }
}
