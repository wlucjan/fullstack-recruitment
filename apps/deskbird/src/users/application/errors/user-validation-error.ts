import { ApplicationError } from '../../../common/application/application.error';

export class UserValidationError extends ApplicationError {
  constructor(message: string) {
    super(message);
  }
}
