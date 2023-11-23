import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Channel } from "src/channels/channel.model";
import { Image } from "src/images/image.model";
import { User } from "src/users/user.model";

@ObjectType()
export class Membership {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => User)
  user: User;

  @Field(() => Int)
  channelId: number;

  @Field(() => Channel)
  channel: Channel;

  @Field()
  isOwner: boolean;

  @Field()
  isSaved: boolean;
  
  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  lastOpenedAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt: Date;
}