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
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HotelsService } from '../services/hotels.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateHotelDto, UpdateHotelDto } from '../dtos';
import { CsvError } from 'csv-parse';
import { ResponsePresenter } from '../../common/presenters/response.presenter';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreate,
  ApiGetAll,
  ApiGetById,
  ApiImportFromCsv,
  ApiUpdate,
} from '../decorators/docs.decorators';

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

      if (
        importResults.successRecords.length === 0 &&
        importResults.errorRecords.length === 0
      ) {
        throw new BadRequestException('No records found in the file');
      }

      if (importResults.successRecords.length === 0) {
        throw new BadRequestException({
          message: 'No records successfully imported',
          data: importResults,
        });
      }

      let message = 'Hotels imported successfully';
      if (importResults.errorRecords.length > 0) {
        message = 'Some records failed to import';
      }

      return this.responsePresenter.formatSuccessResponse(
        message,
        importResults,
      );
    } catch (error) {
      if (error instanceof CsvError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Patch(':id')
  @ApiUpdate()
  async update(
    @Param('id') id: number,
    @Body() updateHotelDto: UpdateHotelDto,
  ) {
    const hotel = await this.hotelsService.update(id, updateHotelDto);
    return this.responsePresenter.formatSuccessResponse(
      'Hotel updated successfully',
      hotel,
    );
  }
}
