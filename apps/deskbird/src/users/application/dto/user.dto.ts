import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UserDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }: { obj: { email: { value: string } | string } }) =>
    typeof obj.email === 'object' ? obj.email.value : obj.email,
  )
  email: string;

  @Expose()
  @Transform(({ obj }: { obj: { role: { value: string } | string } }) =>
    typeof obj.role === 'object' ? obj.role.value : obj.role,
  )
  role: string;
}
