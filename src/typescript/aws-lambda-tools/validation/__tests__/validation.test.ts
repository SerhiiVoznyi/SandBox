import { LambdaRequest } from '../request-base'

// Mock
class TestRequest extends LambdaRequest {
  name?: string
  email?: string
  ege?: number

  protected validate(): void {
    this.ruleFor('name', this.name)
      .required()
      .string()
      .minLength(2)
      .maxLength(250)

    this.ruleFor('email', this.email).required().email().maxLength(100)

    this.ruleFor('ege', this.ege).optional().number().min(18).max(45)
  }
}

//Tests
describe('validation', () => {})
