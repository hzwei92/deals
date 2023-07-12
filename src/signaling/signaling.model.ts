import { Field, InputType, ObjectType } from "@nestjs/graphql";

@InputType()
export class SessionDescriptionInput {
  @Field({ nullable: true })
  sdp?: string;

  @Field()
  type: string;
}

@InputType()
export class CandidateInput {
  @Field()
  candidate: string;

  @Field()
  sdpMid: string;

  @Field()
  sdpMLineIndex: number;

  @Field()
  usernameFragment: string;
}

@InputType()
export class MessageInput {
  @Field(() => SessionDescriptionInput, { nullable: true })
  offer?: SessionDescriptionInput

  @Field(() => SessionDescriptionInput, { nullable: true })
  answer?: SessionDescriptionInput

  @Field(() => CandidateInput, { nullable: true })
  candidate?: CandidateInput
}


@ObjectType()
export class SessionDescription {
  @Field({ nullable: true })
  sdp?: string;

  @Field()
  type: string;
}

@ObjectType()
export class Candidate {
  @Field()
  candidate: string;

  @Field()
  sdpMid: string;

  @Field()
  sdpMLineIndex: number;

  @Field()
  usernameFragment: string;
}

@ObjectType()
export class Message {
  @Field(() => SessionDescription, { nullable: true })
  offer?: SessionDescription

  @Field(() => SessionDescription, { nullable: true })
  answer?: SessionDescription

  @Field(() => Candidate, { nullable: true })
  candidate?: Candidate
}
