import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { ResponsePresenter } from '../common/presenters/response.presenter';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UsersModule],
  providers: [AuthService, ResponsePresenter, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
