import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { GetUserWithEmailQuery } from '../../../users/application/queries/get-user-with-email.query';
import { PASSWORD_SERVICE, PasswordService } from './password-service';
import { User } from '../../../users/application/entities/user';

interface Credentials {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly queryBus: QueryBus,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(PASSWORD_SERVICE)
    private passwordService: PasswordService,
  ) {}

  async login(credentials: Credentials) {
    const user = await this.queryBus.execute<GetUserWithEmailQuery, User>(
      new GetUserWithEmailQuery(credentials.email),
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.passwordService.verify(
      credentials.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id };
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '24h';
    const token = this.jwtService.sign(payload, { expiresIn });

    return Promise.resolve({ access_token: token });
  }
}
