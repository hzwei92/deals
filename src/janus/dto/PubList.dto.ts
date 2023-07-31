import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Jsep, Publisher } from "../janus.model";

@ObjectType()
export class PubList {
  @Field(() => Int)
  room: number;

  @Field(() => Int, { nullable: true })
  feed: number;

  @Field(() => [Publisher])
  publishers: Publisher[];
}