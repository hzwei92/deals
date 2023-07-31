import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Kicked {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;
}
