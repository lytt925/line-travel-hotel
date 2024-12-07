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
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../services';
import { CreateUserDto, UpdateUserDto, UserPublicDto } from '../dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponsePresenter } from '../../common/presenters/response.presenter';
import { AuthGuard } from '../../auth/guards';
import { Request } from 'express';
import {
  ApiCreateUser,
  ApiGetById,
  ApiUpdateUser,
} from '../decorators/docs.decorator';

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
  @ApiCreateUser()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.responsePresenter.formatSuccessResponse(
      'User created successfully',
      user,
    );
  }

  @Get(':id')
  @ApiGetById()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return this.responsePresenter.formatSuccessResponse(
      'User found successfully',
      user,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiUpdateUser()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req['user'];
    if (user.userId !== id) {
      throw new ForbiddenException('You are not allowed to update this user');
    }
    const updatedUser: UserPublicDto = await this.usersService.update(
      id,
      updateUserDto,
    );
    return this.responsePresenter.formatSuccessResponse(
      'User updated successfully',
      updatedUser,
    );
  }
}
