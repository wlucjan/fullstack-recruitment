import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { CaslAuthGuard } from './casl-auth.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtGuard: JwtAuthGuard,
    private readonly caslGuard: CaslAuthGuard,
  ) {}

  public async canActivate(context: ExecutionContext) {
    const guards = [this.jwtGuard, this.caslGuard];

    for (const guard of guards) {
      const result = await guard.canActivate(context);

      if (!result) {
        return false;
      }
    }

    return true;
  }
}
