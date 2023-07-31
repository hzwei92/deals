import { Field, Int, ObjectType } from "@nestjs/graphql";
import { RtpForwarder } from "../janus.model";


@ObjectType()
export class RtpFwdList {
  @Field(() => Int)
  room: number;

  @Field(() => [Forwarder])
  forwarders: RtpForwarder[];
}

@ObjectType()
export class Forwarder {
  @Field(() => Int)
  feed: number;

  @Field(() => [RtpForwarder])
  forwarders: RtpForwarder[];
}