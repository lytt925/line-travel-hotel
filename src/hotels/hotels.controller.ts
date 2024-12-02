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
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CsvError } from 'csv-parse';
import { formatSucessResponse } from 'src/common/presenters/response.presenter';

@Controller({
  path: 'hotels',
  version: '1',
})
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  async findAll() {
    const hotels = await this.hotelsService.findAll();
    return formatSucessResponse('Hotels found successfully', hotels);
  }
  @Post()
  async create(@Body() createHotelDto: CreateHotelDto) {
    const hotel = await this.hotelsService.create(createHotelDto);
    return formatSucessResponse('Hotel created successfully', hotel);
  }

  @Post('import/csv')
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
        return formatSucessResponse(
          'Hotels imported with errors',
          importResults,
        );
      return formatSucessResponse(
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const hotel = await this.hotelsService.findOne(id);
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return formatSucessResponse('Hotel found successfully', hotel);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateHotelDto: UpdateHotelDto,
  ) {
    const hotel = await this.hotelsService.update(id, updateHotelDto);
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return formatSucessResponse('Hotel updated successfully', hotel);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const result = await this.hotelsService.remove(id);
    if (!result) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return formatSucessResponse('Hotel removed successfully');
  }
}
