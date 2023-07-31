import { Field, Int, ObjectType } from "@nestjs/graphql";
import { RtpForwarder } from "../janus.model";


@ObjectType()
export class RtpFwdStarted {
  @Field(() => Int)
  room: number;

  @Field(() => RtpForwarder)
  forwarder: RtpForwarder;
}