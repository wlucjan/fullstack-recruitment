import {
  Body,
  Controller,
  Post,
  Delete,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CreateUserDto, CreateUserResponseDto } from './user.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUserCommand } from '../application/commands/create-user.command';
import { DeleteUserCommand } from '../application/commands/delete-user.command';
import { UserDto } from '../application/dto/user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { Resource } from '../../auth/application/decorators/resource.decorator';
import { RequiredAction } from '../../auth/application/decorators/action.decorator';
import {
  Action,
  Subject,
} from '../../auth/application/casl/casl-ability.factory';

@Controller('users')
@Resource(Subject.User)
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @RequiredAction(Action.Create)
  async create(@Body() user: CreateUserDto): Promise<CreateUserResponseDto> {
    const createdUser = await this.commandBus.execute<
      CreateUserCommand,
      UserDto
    >(new CreateUserCommand(user.email, user.role, user.plainPassword));

    return plainToInstance(CreateUserResponseDto, createdUser);
  }

  @Delete(':id')
  @RequiredAction(Action.Delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
