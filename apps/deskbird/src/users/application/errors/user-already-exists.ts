import { ApplicationError } from '../../../common/application/application.error';
import { UserError } from './user.error';

export class UserAlreadyExistsError extends ApplicationError {
  constructor() {
    super(UserError.EMAIL_ALREADY_EXISTS);
  }
}
