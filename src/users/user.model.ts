import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  phone: string;

  @Field()
  isAdmin: boolean;
}