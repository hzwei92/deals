import { Field, Float, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType()
export class CandidateInput {
  @Field()
  candidate: string;

  @Field()
  sdpMid: string;

  @Field(() => Int)
  sdpMLineIndex: number;

  @Field()
  usernameFragment: string;
}

@InputType()
export class JsepInput {
  @Field()
  type: string;

  @Field()
  sdp: string;
}


@ObjectType()
export class Jsep {
  @Field()
  type: string;

  @Field()
  sdp: string;
}

@ObjectType()
export class Publisher {
  @Field(() => Float)
  feed: number;

  @Field()
  display: string;

  @Field()
  talking: boolean;

  @Field()
  audiocodec: string;

  @Field()
  videocodec: string;

  @Field(() => [String])
  streams: string[];
}

@ObjectType()
export class JoinResponse {
  @Field()
  feed: number;

  @Field()
  room: number;

  @Field()
  display: string;

  @Field(() => [Publisher])
  publishers: Publisher[];
}

@ObjectType()
export class ConfigureResponse {
  @Field(() => Float)
  feed: number;

  @Field()
  room: number;

  @Field(() => Jsep)
  jsep: Jsep;
}

@ObjectType()
export class SubscribeResponse {
  @Field(() => Float)
  feed: number;

  @Field()
  room: number;

  @Field()
  display: string;

  @Field(() => Jsep)
  jsep: Jsep;
}