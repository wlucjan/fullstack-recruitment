import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../entities/user.repository';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../entities/user';

export class GetUserWithEmailQuery {
  constructor(public readonly email: string) {}
}

@QueryHandler(GetUserWithEmailQuery)
export class GetUserWithEmailQueryHandler
  implements IQueryHandler<GetUserWithEmailQuery>
{
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(query: GetUserWithEmailQuery): Promise<User> {
    return this.repo.findByEmail(query.email);
  }
}
