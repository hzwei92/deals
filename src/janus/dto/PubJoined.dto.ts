import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Jsep, Publisher } from "../janus.model";

@ObjectType()
export class PubJoined {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field({ nullable: true })
  display: string;

  @Field({ nullable: true })
  description: string;

  @Field()
  private_id: number;

  @Field(() => [Publisher])
  publishers: Publisher[];

  @Field(() => Jsep, { nullable: true })
  jsep: Jsep;
}