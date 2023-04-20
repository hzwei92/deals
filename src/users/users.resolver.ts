import { Query, Resolver } from '@nestjs/graphql';
import { User } from './user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
  ) {}

  @Query(() => User, { name: 'user' })
  async user(mobile: string): Promise<User | null> {
    return this.usersService.findOne(mobile);
  }
}
