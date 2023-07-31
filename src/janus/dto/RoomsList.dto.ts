import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Participant, Room } from "../janus.model";

@ObjectType()
export class RoomsList {
  @Field(() => [Room])
  list: Room[]
}