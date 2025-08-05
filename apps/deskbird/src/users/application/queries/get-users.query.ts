import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserRepository, USER_REPOSITORY } from '../entities/user.repository';
import { User } from '../entities/user';
import { Page, PaginatedResult } from '../../../common/application/page';

export class GetUsersQuery {
  constructor(public readonly page: Page) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(query: GetUsersQuery): Promise<PaginatedResult<User>> {
    return this.repo.findAll(query.page);
  }
}
