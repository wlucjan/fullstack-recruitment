import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Roles } from '../application/enums/role';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

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

export class GetUsersQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

@Exclude()
export class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  role: string;
}

export class PageMetadataDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  hasPrevious: boolean;

  @ApiProperty()
  hasNext: boolean;
}

export class GetUsersResponseDto {
  @ApiProperty({ type: [UserDto] })
  data: UserDto[];

  @ApiProperty({ type: PageMetadataDto })
  metadata: PageMetadataDto;
}
