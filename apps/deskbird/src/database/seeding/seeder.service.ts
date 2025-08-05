import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../users/application/commands/create-user.command';
import { Roles } from '../../users/application/enums/role';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly commandBus: CommandBus) {}

  async seed(): Promise<void> {
    this.logger.log('Starting database seeding...');

    await this.seedAdminUser();

    this.logger.log('Database seeding completed successfully');
  }

  private async seedAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@deskbird.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    try {
      await this.commandBus.execute(
        new CreateUserCommand(adminEmail, Roles.ADMIN, adminPassword),
      );

      this.logger.log(`Admin user created with email: ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Failed to seed admin user: ${error.message}`);
      throw error;
    }
  }
}
