import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Jsep } from "../janus.model";


@ObjectType()
export class Configured {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field({ nullable: true })
  display: string;

  @Field({ nullable: true })
  restart: boolean;

  @Field({ nullable: true })
  update: boolean;

  @Field({ nullable: true })
  configured: string;

  @Field(() => Jsep)
  jsep: Jsep;
}
