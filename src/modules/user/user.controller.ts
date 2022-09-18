import { Controller, Get } from '@nestjs/common';
import { UserData } from 'src/decorators/user.decorator';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  async getProfile(@UserData() user: UserEntity) {
    return this.userService.getUserProfile(user.email);
  }
}
