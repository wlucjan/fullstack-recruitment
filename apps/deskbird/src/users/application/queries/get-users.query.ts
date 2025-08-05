import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserRepository, USER_REPOSITORY } from '../entities/user.repository';
import { UserListDto } from '../dto/user-list.dto';
import { User } from '../entities/user';
import { Page, PaginatedResult } from '../../../common/application/page';
import { plainToInstance } from 'class-transformer';

export class GetUsersQuery {
  constructor(public readonly page: Page) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(query: GetUsersQuery): Promise<PaginatedResult<UserListDto>> {
    const result = await this.repo.findAll(query.page);
    
    const safeUsers = result.result.map(user => 
      plainToInstance(UserListDto, {
        id: user.id,
        email: user.email.value,
        role: user.role.value,
      })
    );

    return new PaginatedResult(safeUsers, result.totalCount);
  }
}
