import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  mobile: string;

  @Field()
  isAdmin: boolean;
}