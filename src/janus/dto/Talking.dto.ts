import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Jsep, Publisher } from "../janus.model";

@ObjectType()
export class Talking {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field({ nullable: true })
  talking: boolean;

  @Field(() => Int)
  audio_level: number;
}