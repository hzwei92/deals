import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Channel } from "src/channels/channel.model";
import { Image } from "src/images/image.model";
import { User } from "src/users/user.model";

@ObjectType()
export class Post {
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
  text: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt: Date;
}