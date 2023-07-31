import { Field, Int, ObjectType } from "@nestjs/graphql";


@ObjectType()
export class Switched {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  from_feed: number;

  @Field(() => Int)
  to_feed: number;

  @Field()
  switched: string;

  @Field()
  display: string;
}