import { OmitType } from '@nestjs/swagger';
import { User } from '../../entities/user.entity';
export class UserPublicDto extends OmitType(User, ['password'] as const) {}
