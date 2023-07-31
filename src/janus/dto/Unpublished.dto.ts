import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Unpublished {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;
}