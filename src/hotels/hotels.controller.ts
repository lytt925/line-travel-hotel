import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpStatus,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateHotelDto } from './dtos/requests/create-hotel.dto';
import { UpdateHotelDto } from './dtos/requests/update-hotel.dto';
import { CsvError } from 'csv-parse';
import { ResponsePresenter } from '../common/presenters/response.presenter';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreate,
  ApiGetAll,
  ApiGetById,
  ApiImportFromCsv,
  ApiUpdate,
} from './decorators/docs.decorators';

@ApiTags('hotels')
@Controller({
  path: 'hotels',
  version: '1',
})
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly responsePresenter: ResponsePresenter,
  ) {}

  @Get(':id')
  @ApiGetById()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const hotel = await this.hotelsService.findOne(id);
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return this.responsePresenter.formatSuccessResponse(
      'Hotel found successfully',
      hotel,
    );
  }

  @Get()
  @ApiGetAll()
  async findAll(@Query('page') page?: number): Promise<any> {
    page = isNaN(page) ? 1 : page;
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException(
        'Page must be an integer greater than or equal to 1',
      );
    }

    const hotels = await this.hotelsService.findAll(page);
    return this.responsePresenter.formatSuccessResponse(
      'Hotels found successfully',
      {
        hotels,
        page,
      },
    );
  }

  @Post()
  @ApiCreate()
  async create(@Body() createHotelDto: CreateHotelDto) {
    const hotel = await this.hotelsService.create(createHotelDto);
    return this.responsePresenter.formatSuccessResponse(
      'Hotel created successfully',
      hotel,
    );
  }

  @Post('import/csv')
  @ApiImportFromCsv()
  @UseInterceptors(FileInterceptor('file'))
  async importFromFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'text/csv',
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const importResults = await this.hotelsService.importFromFile(file);
      if (importResults.errorRecords.length > 0)
        return this.responsePresenter.formatSuccessResponse(
          'Hotels imported with errors',
          importResults,
        );
      return this.responsePresenter.formatSuccessResponse(
        'Hotels imported successfully',
        importResults,
      );
    } catch (error) {
      if (error instanceof CsvError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Patch(':id')
  @ApiUpdate()
  async update(
    @Param('id') id: number,
    @Body() updateHotelDto: UpdateHotelDto,
  ) {
    const result = await this.hotelsService.update(id, updateHotelDto);
    if (!result) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return this.responsePresenter.formatSuccessResponse(
      'Hotel updated successfully',
    );
  }
}
