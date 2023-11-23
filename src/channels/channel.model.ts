import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { Membership } from "src/memberships/membership.model";
import { User } from "src/users/user.model";

@ObjectType()
export class Channel {
  @Field(() => Int)
  id: number;

  @Field(() => [Membership])
  memberships: Membership[];
  
  @Field()
  name: string;

  @Field()
  detail: string;

  @Field(() => Float)
  lng: number;

  @Field(() => Float)
  lat: number;

  @Field(() => Int)
  memberCount: number;

  @Field(() => Int)
  activeUserCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt: Date;
}