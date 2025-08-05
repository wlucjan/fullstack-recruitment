import { Roles } from '../../../users/application/enums/role';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Roles;
}
