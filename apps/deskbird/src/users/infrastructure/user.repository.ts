import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserRepository } from '../application/entities/user.repository';
import { User as DomainUser } from '../application/entities/user';
import { UserOrmEntity } from './user.entity';
import { UserNotFoundError } from '../application/errors/user-not-found';
import { UserAlreadyExistsError } from '../application/errors/user-already-exists';
import { Page, PaginatedResult } from '../../common/application/page';

@Injectable()
export class UserSqlRepository implements UserRepository {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async create(user: DomainUser): Promise<DomainUser> {
    const savedUser = await this.datasource.transaction(
      async (transactionalEntityManager) => {
        const exists = await transactionalEntityManager.findOne(UserOrmEntity, {
          where: { email: user.email.value },
        });

        if (exists) {
          throw new UserAlreadyExistsError();
        }

        return await transactionalEntityManager.save(
          UserOrmEntity.fromDomain(user),
        );
      },
    );

    if (!savedUser) {
      throw new Error('User not saved');
    }

    return savedUser.toDomain();
  }

  async findById(id: string): Promise<DomainUser> {
    const entity = await this.repo.findOne({ where: { id } });

    if (!entity) {
      throw new UserNotFoundError();
    }

    return entity.toDomain();
  }

  async findByEmail(email: string): Promise<DomainUser | null> {
    const entity = await this.repo.findOne({ where: { email } });

    if (!entity) {
      return null;
    }

    return entity.toDomain();
  }

  async findAll(page: Page): Promise<PaginatedResult<DomainUser>> {
    const [entities, totalCount] = await this.repo.findAndCount({
      skip: page.offset,
      take: page.limit,
    });

    const domainUsers = entities.map((entity) => entity.toDomain());

    return new PaginatedResult(domainUsers, totalCount);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });

    if (!entity) {
      throw new UserNotFoundError();
    }

    await this.repo.remove(entity);
  }
}
