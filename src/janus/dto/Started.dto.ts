import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Started {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field()
  started: string;
}