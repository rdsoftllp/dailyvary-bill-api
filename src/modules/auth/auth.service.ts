import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppResponse } from 'src/common';
import { User } from 'src/schema/user.schema';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { LoginEntity } from './entities/login.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  public async validateUser(email: string, password: string) {
    try {
      const user = await this.userService.findUserByPin(parseInt(email || password))
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      this.logger.error(`Error while validating user`, error);
      return null;
    }
  }

  public async login(userFromReq: LoginDto): Promise<AppResponse.ApiResponse> {
    try {
      const user = await this.userService.findUserByPin(userFromReq.pin)
      if (!user) {
        return AppResponse.ApiErrorResponse(
          {},
          'Invalid account, please hek email',
          HttpStatus.BAD_REQUEST,
        );
      }
      const payload = {
        email: user.email,
        sub: {},
      };
      payload.sub = user;
      return AppResponse.ApiSuccessResponse(
        new LoginEntity({
          accessToken: this.jwtService.sign(payload),
          user,
        }),
        'Login success',
        HttpStatus.CREATED,
      );
    } catch (error) {
      this.logger.error(`Error while login user`, error);
      throw new HttpException(
        'Error while login in',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
