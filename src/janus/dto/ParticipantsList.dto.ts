import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Participant } from "../janus.model";

@ObjectType()
export class ParticipantsList {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field(() => [Participant])
  participants: Participant[];
}