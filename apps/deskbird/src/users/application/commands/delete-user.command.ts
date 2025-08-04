import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { USER_REPOSITORY, UserRepository } from '../entities/user.repository';
import { Inject } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    return this.repo.delete(command.id);
  }
}
