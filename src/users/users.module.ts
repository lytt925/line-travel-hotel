import { Module } from '@nestjs/common';
import { UsersService } from './services';
import { UsersController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.orm-entity';
import { ResponsePresenter } from '../common/presenters/response.presenter';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, ResponsePresenter, JwtService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
