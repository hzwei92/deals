import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";
import { Channel } from "../channel.model";

@ObjectType()
export class JoinChannelResult {
  @Field(() => User)
  user: User;

  @Field(() => [Channel])
  channels: Channel[];
}
