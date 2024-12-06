import { UserEntity } from 'src/users/entities/user.orm-entity';
import { UserPublicDto } from '../dto';

export function mapUserEntityToPublicDto(user: UserEntity): UserPublicDto {
  const { id, firstName, lastName, email } = user;
  return { id, firstName, lastName, email };
}
