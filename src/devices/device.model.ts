import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";

@ObjectType()
export class Device {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => User)
  user: User;

  @Field()
  apnsToken: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt: Date;
}