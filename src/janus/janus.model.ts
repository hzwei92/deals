import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

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
export class Stream {
  @Field()
  type: string;

  @Field(() => Int)
  mindex: number;

  @Field()
  mid: string;

  @Field()
  codec: string;

  @Field({ nullable: true })
  fec: boolean;
}

@ObjectType()
export class Publisher {
  @Field(() => Int)
  feed: number;

  @Field()
  display: string;

  @Field({ nullable: true })
  talking: boolean;

  @Field()
  audiocodec: string;

  @Field()
  videocodec: string;

  @Field({ nullable: true })
  simulcast: boolean;

  @Field(() => [Stream])
  streams: Stream[];
}

@ObjectType()
export class Participant {
  @Field(() => Int)
  feed: number;

  @Field({ nullable: true })
  display: string;

  @Field()
  publisher: boolean;

  @Field()
  talking: boolean;
}

@ObjectType()
export class RtpForwarder {
  @Field()
  host: string;

  @Field(() => Int)
  audio_port: number;

  @Field(() => Int)
  audio_rtcp_port: number;

  @Field(() => Int)
  audio_stream: number;

  @Field(() => Int)
  video_port: number;

  @Field(() => Int)
  video_rtcp_port: number;

  @Field(() => Int)
  video_stream: number;

  @Field(() => Int)
  data_port: number;

  @Field(() => Int)
  data_stream: number;

  @Field(() => Int)
  ssrc: number;

  @Field(() => Int)
  pt: number;

  @Field(() => Int)
  sc_substream_layer: number;

  @Field()
  srtp: boolean;
}

@ObjectType()
export class Room {
  @Field(() => Int)
  room: number;

  @Field()
  description: string;

  @Field()
  pin_required: boolean;

  @Field()
  is_private: boolean;

  @Field(() => Int)
  max_publishers: number;

  @Field(() => Int)
  bitrate: number;

  @Field(() => Int)
  fir_freq: number;

  @Field()
  require_pvtid: boolean;

  @Field()
  require_e2ee: boolean;

  @Field()
  dummy_publisher: boolean;

  @Field()
  audiocodec: string;

  @Field()
  videocodec: string;

  @Field()
  opus_fec: boolean;

  @Field()
  record: boolean;

  @Field()
  lock_record: boolean;

  @Field(() => Int)
  num_participants: number;

  @Field()
  audiolevel_ext: boolean;

  @Field()
  audiolevel_event: boolean;

  @Field()
  videoorient_ext: boolean;

  @Field()
  playoutdelay_ext: boolean;

  @Field()
  transport_wide_cc_ext: boolean;
}