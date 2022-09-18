import { Exclude, Transform, Type } from 'class-transformer';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { User } from 'src/schema/user.schema';

export class LoginEntity {
  accessToken: string;

  @Type(() => UserEntity)
  @Transform((param) => new UserEntity(param.value))
  user: User;

  constructor(partial: Partial<LoginEntity>) {
    Object.assign(this, partial);
  }
}
