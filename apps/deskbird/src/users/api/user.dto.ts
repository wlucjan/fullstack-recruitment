import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Roles } from '../application/enums/role';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Roles })
  @IsEnum(Roles)
  role: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  plainPassword: string;
}

@Exclude()
export class CreateUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  role: string;
}
