import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from '../services';
import { CreateUserDto, UpdateUserDto, UserPublicDto } from '../dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponsePresenter } from '../../common/presenters/response.presenter';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responsePresenter: ResponsePresenter,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.responsePresenter.formatSuccessResponse(
      'User created successfully',
      user,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return this.responsePresenter.formatSuccessResponse(
      'User found successfully',
      user,
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user: UserPublicDto = await this.usersService.update(
      id,
      updateUserDto,
    );
    return this.responsePresenter.formatSuccessResponse(
      'User updated successfully',
      user,
    );
  }
}
