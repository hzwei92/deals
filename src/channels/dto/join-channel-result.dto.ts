import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";
import { Channel } from "../channel.model";
import { Membership } from "src/memberships/membership.model";

@ObjectType()
export class JoinChannelResult {
  @Field(() => Channel)
  channel: Channel;

  @Field(() => Membership)
  membership: Membership;
}
