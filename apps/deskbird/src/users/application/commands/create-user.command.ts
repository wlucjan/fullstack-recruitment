import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  UserWriteRepository,
  USER_WRITE_REPOSITORY,
} from '../entities/user.repository';
import { User } from '../entities/user';
import { UserDto } from '../dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { Email } from '../value-objects/email';
import { Role } from '../value-objects/role';
import {
  PASSWORD_SERVICE,
  PasswordService,
} from '../../../auth/application/services/password-service';

export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly role: string,
    public readonly plainPassword: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  constructor(
    @Inject(USER_WRITE_REPOSITORY)
    private readonly repository: UserWriteRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserDto> {
    const { email, role, plainPassword } = command;

    const passwordHash = await this.passwordService.hash(plainPassword);

    const createdUser = await this.repository.create(
      User.create(Email.create(email), Role.create(role), passwordHash),
    );

    return plainToInstance(UserDto, createdUser);
  }
}
