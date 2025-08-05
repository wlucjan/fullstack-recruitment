import { SetMetadata } from '@nestjs/common';
import { Subjects } from '../casl/casl-ability.factory';

export const RESOURCE_KEY = 'casl_resource';
export const Resource = (resource: Subjects) =>
  SetMetadata(RESOURCE_KEY, resource);
