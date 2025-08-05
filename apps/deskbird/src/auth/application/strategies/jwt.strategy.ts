import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserWithEmailQuery } from '../../../users/application/queries/get-user-with-email.query';
import { User } from '../../../users/application/entities/user';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly queryBus: QueryBus,
  ) {
    const secret = configService.get<string>('JWT_SECRET_KEY');
    if (!secret) {
      throw new Error('JWT_SECRET_KEY is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
  }): Promise<AuthenticatedUser> {
    const user = await this.queryBus.execute<GetUserWithEmailQuery, User>(
      new GetUserWithEmailQuery(payload.email),
    );

    return {
      userId: user.id,
      email: user.email.value,
      role: user.role.value,
    };
  }
}
