import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './';
import { ResponsePresenter } from '../../common/presenters/response.presenter';
import { UsersService } from '../services';
import { CreateUserDto, UserPublicDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ForbiddenException } from '@nestjs/common';

const mockUsersService = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let responsePresenter: ResponsePresenter;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService(),
        },
        {
          provide: JwtService,
          useValue: jest.fn(),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        ResponsePresenter,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    responsePresenter = module.get<ResponsePresenter>(ResponsePresenter);
    usersService = module.get<UsersService>(UsersService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'test@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'Password123',
    };
    const mockUser = {
      id: 1,
      firstName: mockCreateUserDto.firstName,
      lastName: mockCreateUserDto.lastName,
      email: mockCreateUserDto.email,
    };
    const mockCreateResponse = {
      message: 'User created successfully',
      data: mockUser,
    };

    it('should create a user', async () => {
      usersService.create.mockResolvedValue(mockUser);
      const spyOnFormatSuccessResponse = jest.spyOn(
        responsePresenter,
        'formatSuccessResponse',
      );
      const result = await controller.create(mockCreateUserDto);
      expect(usersService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(spyOnFormatSuccessResponse).toHaveBeenCalledWith(
        'User created successfully',
        mockUser,
      );
      expect(result).toEqual(mockCreateResponse);
    });
  });

  describe('findOne', () => {
    const mockUserPublic: UserPublicDto = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@gmail.com',
    };
    it('should return a user by ID', async () => {
      const spyOnFormatSuccessResponse = jest.spyOn(
        responsePresenter,
        'formatSuccessResponse',
      );
      usersService.findOne.mockResolvedValue(mockUserPublic);
      const result = await controller.findOne(1);
      expect(spyOnFormatSuccessResponse).toHaveBeenCalledWith(
        'User found successfully',
        mockUserPublic,
      );
      expect(result).toEqual({
        message: 'User found successfully',
        data: mockUserPublic,
      });
    });
  });

  describe('update', () => {
    const mockUpdateUserDto = { firstName: 'John' };
    const mockUserPublic: UserPublicDto = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@gmail.com',
    };
    it('should update a user', async () => {
      usersService.update.mockResolvedValue(mockUserPublic);
      const request = {
        user: {
          userId: 1,
        },
      } as unknown as Request;
      const result = await controller.update(1, mockUpdateUserDto, request);
      expect(usersService.update).toHaveBeenCalledWith(1, mockUpdateUserDto);
      expect(result).toEqual({
        message: 'User updated successfully',
        data: mockUserPublic,
      });
    });

    it('should return 403 if user is not the owner', async () => {
      const request = {
        user: {
          userId: 2,
        },
      } as unknown as Request;
      expect(controller.update(1, mockUpdateUserDto, request)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
