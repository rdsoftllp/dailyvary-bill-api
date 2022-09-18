import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  phone?: string;

  @Exclude()
  pin: number;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
