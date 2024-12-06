import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { ResponsePresenter } from '../../common/presenters/response.presenter';
import { UsersService } from '../services';
import { CreateUserDto } from '../dto';

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
});
