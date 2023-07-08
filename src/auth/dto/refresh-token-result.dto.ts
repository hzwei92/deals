import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";

@ObjectType()
export class RefreshTokentResult {
  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;
}
