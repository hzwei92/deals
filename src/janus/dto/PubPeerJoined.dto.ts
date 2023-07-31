import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Jsep, Publisher } from "../janus.model";

@ObjectType()
export class PubPeerJoined {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field({ nullable: true })
  display: string;
}