import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Channel } from "src/channels/channel.model";
import { Deal } from "src/deals/deal.model";
import { Membership } from "src/memberships/membership.model";

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  activeChannelId: number;

  @Field(() => Channel, { nullable: true })
  activeChannel: Channel;

  @Field()
  isAdmin: boolean;

  @Field(() => [Deal])
  offers: Deal[]

  @Field(() => [Membership])
  memberships: Membership[]
}