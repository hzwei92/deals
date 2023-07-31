import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Jsep, Stream } from "../janus.model";

@ObjectType()
export class Created {
  @Field(() => Int)
  room: number;

  @Field(() => Jsep)
  jsep: Jsep;

  @Field(() => [Stream])
  streams: Stream[];
}