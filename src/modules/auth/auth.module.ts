import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from '../user/user.module';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(EnvConfig.JWT_SECRET),
        signOptions: { expiresIn: configService.get(EnvConfig.JWT_EXPIRES_IN) },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [JwtStrategy, LocalStrategy, AuthService, LocalAuthGuard, JwtAuthGuard],
  controllers: [AuthController]
})
export class AuthModule { }
