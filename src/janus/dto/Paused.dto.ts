import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Paused {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field()
  paused: string;
}