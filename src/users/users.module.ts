import { Module } from '@nestjs/common';
import { UsersService } from './services';
import { UsersController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.orm-entity';
import { ResponsePresenter } from 'src/common/presenters/response.presenter';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, ResponsePresenter],
  controllers: [UsersController],
})
export class UsersModule {}
