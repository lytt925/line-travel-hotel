import { OmitType } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { Hotel } from 'src/hotels/entities/hotel.entity';
import { ImportResult } from 'src/hotels/types/hotel.service.type';

export class GetByIdResponseDto extends BaseResponseDto<Hotel> {}
export class GetAllResponseDto extends BaseResponseDto<Hotel[]> {}
export class CreateResponseDto extends BaseResponseDto<Hotel> {}
export class ImportResponseDto extends BaseResponseDto<ImportResult> {}
export class UpdateResponseDto extends BaseResponseDto<Hotel> {}
export class DeleteResponseDto extends OmitType(BaseResponseDto, ['data']) {}
