import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RtpFwdStopped {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field(() => Int)
  stream: number;
}