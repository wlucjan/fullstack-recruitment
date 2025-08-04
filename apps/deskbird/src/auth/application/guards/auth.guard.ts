import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtGuard: JwtAuthGuard) {}

  public async canActivate(context: ExecutionContext) {
    const guards = [this.jwtGuard];

    for (const guard of guards) {
      const result = await guard.canActivate(context);

      if (!result) {
        return false;
      }
    }

    return true;
  }
}
