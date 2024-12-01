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

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  async findAll() {
    return await this.hotelsService.findAll();
  }
  @Post()
  async create(@Body() createHotelDto: CreateHotelDto) {
    return await this.hotelsService.create(createHotelDto);
  }

  @Post('import')
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
      return await this.hotelsService.importFromFile(file);
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
    return { data: hotel };
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
    return { data: hotel };
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const result = await this.hotelsService.remove(id);
    if (!result) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return 'Hotel removed successfully';
  }
}
