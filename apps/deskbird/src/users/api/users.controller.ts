import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto, CreateUserResponseDto } from './user.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUserCommand } from '../application/commands/create-user.command';
import { UserDto } from '../application/dto/user.dto';
import { CommandBus } from '@nestjs/cqrs';

@Controller('users')
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() user: CreateUserDto): Promise<CreateUserResponseDto> {
    const createdUser = await this.commandBus.execute<
      CreateUserCommand,
      UserDto
    >(new CreateUserCommand(user.email, user.role, user.plainPassword));

    return plainToInstance(CreateUserResponseDto, createdUser);
  }
}
