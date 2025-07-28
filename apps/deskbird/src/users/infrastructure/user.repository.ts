import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserWriteRepository } from '../application/entities/user.repository';
import { User as DomainUser } from '../application/entities/user';
import { UserOrmEntity } from './user.entity';
import { UserNotFoundError } from '../application/errors/user-not-found';
import { UserAlreadyExistsError } from '../application/errors/user-already-exists';

@Injectable()
export class UserRepository implements UserWriteRepository {
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

    return savedUser.toDomain();
  }

  async findById(id: string): Promise<DomainUser> {
    const entity = await this.repo.findOne({ where: { id } });

    if (!entity) {
      throw new UserNotFoundError();
    }

    return entity.toDomain();
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });

    if (!entity) {
      throw new UserNotFoundError();
    }

    await this.repo.remove(entity);
  }
}
