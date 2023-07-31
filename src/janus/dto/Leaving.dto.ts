import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Leaving {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field({ nullable: true })
  reason: string;
}
