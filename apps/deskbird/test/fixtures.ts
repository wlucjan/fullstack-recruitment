import { UserDto } from 'src/users/application/dto/user.dto';
import { DataSource } from 'typeorm';

export async function cleanUsersTable(dataSource: DataSource) {
  const connection = dataSource.manager.connection;
  await connection.query('TRUNCATE users');
}
export async function seedUserFixture(dataSource: DataSource, user: UserDto) {
  const connection = dataSource.manager.connection;
  await connection.query(
    'INSERT INTO users (id, email, role, "passwordHash") VALUES ($1, $2, $3, $4)',
    [
      user.id,
      user.email,
      user.role,
      '$argon2i$v=19$m=16,t=2,p=1$NDlvUFJSVHVnTmlqME9ZSA$Flwho1p1wTuQc3W9RdIV9g', // password = password
    ],
  );
}
