import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Jsep } from "../janus.model";

@ObjectType()
export class SubJoined {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field()
  display: string;

  @Field(() => Jsep)
  jsep: Jsep;
}
