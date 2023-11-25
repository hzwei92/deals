import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
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

  @Field()
  name: string;

  @Field({ nullable: true })
  activeChannelId: number;

  @Field(() => Channel, { nullable: true })
  activeChannel: Channel;

  @Field()
  isAdmin: boolean;

  @Field()
  isCamOn: boolean;

  @Field()
  isMicOn: boolean;

  @Field()
  isSoundOn: boolean;

  @Field(() => Float)
  lng: number;

  @Field(() => Float)
  lat: number;

  @Field(() => Float)
  zoom: number;  

  @Field(() => [Deal])
  offers: Deal[]

  @Field(() => [Membership])
  memberships: Membership[]
}