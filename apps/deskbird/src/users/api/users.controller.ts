import * as crypto from 'crypto';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto, CreateUserResponseDto } from './user.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() user: CreateUserDto): Promise<CreateUserResponseDto> {
    return plainToInstance(CreateUserResponseDto, {
      id: crypto.randomUUID(),
      ...user,
    });
  }
}
