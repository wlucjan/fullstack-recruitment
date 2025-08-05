import { SetMetadata } from '@nestjs/common';
import { Action } from '../casl/casl-ability.factory';

export const ACTION_KEY = 'casl_action';
export const RequiredAction = (action: Action) =>
  SetMetadata(ACTION_KEY, action);
