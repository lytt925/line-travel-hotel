import {
  NotFoundException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UpdateUserDto, CreateUserDto, UserPublicDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.orm-entity';
import { mapUserEntityToPublicDto } from '../mappers/user.mapper';
import * as argon2 from 'argon2';
import { merge } from 'lodash';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOneByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserPublicDto> {
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await argon2.hash(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);
    return mapUserEntityToPublicDto(savedUser);
  }

  async findOne(id: number): Promise<UserPublicDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return mapUserEntityToPublicDto(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserPublicDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      const userGetByEmail = await this.findOneByEmail(updateUserDto.email);
      if (userGetByEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }

    const updatedUser = merge(user, updateUserDto);
    await this.userRepository.update(id, updatedUser);
    return mapUserEntityToPublicDto(updatedUser);
  }
}
