import { PropertyRuleBuilder } from './property-rule-builder'
import { ValidationError, ValidationResult } from './validation-result'

export abstract class LambdaRequest {
  private _errors: ValidationError[]

  constructor() {
    this._errors = []
  }

  public validationResult(): ValidationResult {
    this._errors = []
    this.validate()
    return {
      isValid: this._errors.length === 0,
      errors: [...this._errors],
    }
  }

  protected abstract validate(): void

  protected ruleFor<T>(property: string, value: T): PropertyRuleBuilder<T> {
    return new PropertyRuleBuilder<T>(property, value, (error) =>
      this._errors.push(error)
    )
  }
}
