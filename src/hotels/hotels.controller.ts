import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  NotFoundException,
  BadRequestException,
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
  ApiDelete,
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
  async findAll() {
    const hotels = await this.hotelsService.findAll();
    return this.responsePresenter.formatSuccessResponse(
      'Hotels found successfully',
      hotels,
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
      } else {
        throw error;
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

  @Delete(':id')
  @ApiDelete()
  async remove(@Param('id') id: number) {
    const result = await this.hotelsService.remove(id);
    if (!result) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return this.responsePresenter.formatSuccessResponse(
      'Hotel removed successfully',
    );
  }
}
