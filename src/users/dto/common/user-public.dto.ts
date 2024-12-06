import { User } from 'src/users/entities/user.entity';

export class UserPublicDto implements User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
