import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.orm-entity';
import { CreateUserDto, UpdateUserDto } from '../dto';
import * as argon2 from 'argon2';

const mockUserRepository = () => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<UserEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    ) as jest.Mocked<Repository<UserEntity>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'ytli.tw@gmail.com',
      firstName: 'YT',
      lastName: 'Li',
      password: 'Password123',
    };
    it('should create a user', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      usersRepository.create.mockReturnValue({
        ...mockCreateUserDto,
        id: 1,
      });
      usersRepository.save.mockResolvedValue({
        ...mockCreateUserDto,
        id: 1,
      });

      const spyOnArgon2Hash = jest.spyOn(argon2, 'hash');
      const result = await service.create(mockCreateUserDto);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: mockCreateUserDto.email,
      });
      expect(spyOnArgon2Hash).toHaveBeenCalledWith(mockCreateUserDto.password);
      expect(result).toEqual({
        id: 1,
        email: mockCreateUserDto.email,
        firstName: mockCreateUserDto.firstName,
        lastName: mockCreateUserDto.lastName,
      });
    });

    it('should throw an error if email already exists', async () => {
      usersRepository.findOneBy.mockResolvedValue({
        ...mockCreateUserDto,
        id: 1,
      });
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    const mockUser = {
      id: 1,
      email: 'test@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
    };
    it('should return a user by email', async () => {
      usersRepository.findOneBy.mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockUser: UserEntity = {
      id: 1,
      lastName: 'Doe',
      firstName: 'John',
      email: 'test1@gmail.com',
      password: 'Password123',
    };
    const existingUsers = [
      mockUser,
      { ...mockUser, id: 2, email: 'test3@gmail.com' },
    ];

    const mockUpdateUserDto: UpdateUserDto = {
      email: 'test2@gmail.com',
      password: 'Password1234',
      firstName: 'John2',
    };
    it('should update a user successfullly', async () => {
      usersRepository.findOneBy
        .mockResolvedValueOnce(existingUsers[0])
        .mockResolvedValueOnce(null);
      usersRepository.update.mockResolvedValue({ affected: 1 } as any);

      const spyOnArgon2Hash = jest.spyOn(argon2, 'hash');
      const result = await service.update(1, mockUpdateUserDto);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(spyOnArgon2Hash).toHaveBeenCalledWith('Password1234');
      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        ...mockUser,
        ...mockUpdateUserDto,
        password: expect.stringMatching(/^\$argon2/),
      });
      expect(result).toEqual({
        id: 1,
        email: 'test2@gmail.com',
        firstName: 'John2',
        lastName: 'Doe',
      });
    });

    it('should throw an error if user is not found', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      await expect(service.update(1, mockUpdateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if email already exists', async () => {
      usersRepository.findOneBy
        .mockResolvedValueOnce(existingUsers[0])
        .mockResolvedValueOnce(existingUsers[1]);
      await expect(service.update(1, mockUpdateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
