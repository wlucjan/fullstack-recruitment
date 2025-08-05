import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserListDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  role: string;
}