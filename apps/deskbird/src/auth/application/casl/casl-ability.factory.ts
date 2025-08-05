import { Injectable } from '@nestjs/common';
import { AbilityBuilder, PureAbility, createMongoAbility } from '@casl/ability';
import { Roles } from '../../../users/application/enums/role';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export enum Subject {
  All = 'all',
  User = 'User',
}

export type Subjects = (typeof Subject)[keyof typeof Subject];
export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(userRole: Roles): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (userRole === Roles.ADMIN) {
      can(Action.Manage, Subject.All);
    } else {
      can(Action.Read, Subject.User);
      cannot(Action.Create, Subject.User);
      cannot(Action.Delete, Subject.User);
    }

    return build();
  }
}
