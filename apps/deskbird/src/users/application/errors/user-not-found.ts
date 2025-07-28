import { ApplicationError } from '../../../common/application/application.error';
import { UserError } from './user.error';

export class UserNotFoundError extends ApplicationError {
  constructor() {
    super(UserError.NOT_FOUND);
  }
}
