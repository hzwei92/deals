import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";
import { Channel } from "../channel.model";
import { Membership } from "src/memberships/membership.model";

@ObjectType()
export class ActivateChannelResult {
  @Field(() => User)
  user: User;

  @Field(() => [Channel])
  channels: Channel[];

  @Field(() => [Membership])
  memberships: Membership[];
}
