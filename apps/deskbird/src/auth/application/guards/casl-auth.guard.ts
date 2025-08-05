import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CaslAbilityFactory,
  Action,
  Subjects,
} from '../casl/casl-ability.factory';
import { RESOURCE_KEY } from '../decorators/resource.decorator';
import { ACTION_KEY } from '../decorators/action.decorator';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class CaslAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredResource = this.reflector.getAllAndOverride<Subjects>(
      RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredAction = this.reflector.getAllAndOverride<Action>(
      ACTION_KEY,
      [context.getHandler()],
    );

    if (!requiredResource || !requiredAction) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const ability = this.caslAbilityFactory.createForUser(user.role);

    if (ability.cannot(requiredAction, requiredResource)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
