export type ValidationError = {
  property: string
  message: string
  rules: string[]
}

export type ValidationResult = {
  isValid: boolean
  errors: ValidationError[]
}
