import {
  Body,
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  CreateUserDto,
  CreateUserResponseDto,
  GetUsersQueryDto,
  GetUsersResponseDto,
  UserDto as UserResponseDto,
  PageMetadataDto,
} from './user.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUserCommand } from '../application/commands/create-user.command';
import { DeleteUserCommand } from '../application/commands/delete-user.command';
import { GetUsersQuery } from '../application/queries/get-users.query';
import { UserDto } from '../application/dto/user.dto';
import { UserListDto } from '../application/dto/user-list.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Resource } from '../../auth/application/decorators/resource.decorator';
import { RequiredAction } from '../../auth/application/decorators/action.decorator';
import {
  Action,
  Subject,
} from '../../auth/application/casl/casl-ability.factory';
import {
  Page,
  PageMetadata,
  PaginatedResult,
} from '../../common/application/page';

@Controller('users')
@Resource(Subject.User)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @RequiredAction(Action.Read)
  async findAll(
    @Query() query: GetUsersQueryDto,
  ): Promise<GetUsersResponseDto> {
    const page = new Page(query.page || 1, query.limit || 10);

    const result = await this.queryBus.execute<
      GetUsersQuery,
      PaginatedResult<UserListDto>
    >(new GetUsersQuery(page));

    const metadata = new PageMetadata(result.totalCount, page.limit, page.page);

    return {
      data: plainToInstance(UserResponseDto, result.result),
      metadata: plainToInstance(PageMetadataDto, metadata),
    };
  }

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
