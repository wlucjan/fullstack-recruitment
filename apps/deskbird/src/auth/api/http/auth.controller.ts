import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { AuthenticateUserDto } from './auth.dto';
import { PublicEndpoint } from '../../application/decorators/public';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @PublicEndpoint()
  @Post('login')
  async login(@Body() credentials: AuthenticateUserDto) {
    const { access_token } = await this.authService.login(credentials);

    // TODO: in prod environment refresh token would be necessary, and access token lifetime should be in minutes; ideally a generic auth service like AWS Cognito would be used
    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 86400, // 24 hours in seconds
    };
  }
}
