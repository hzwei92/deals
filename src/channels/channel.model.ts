import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";

@ObjectType()
export class Channel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  ownerId: number;

  @Field(() => User)
  owner: User;

  @Field()
  name: string;

  @Field()
  detail: string;

  @Field(() => Float)
  lng: number;

  @Field(() => Float)
  lat: number;

  @Field(() => Int)
  liveUserCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt: Date;
}