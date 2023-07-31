import { Field, Int, ObjectType } from "@nestjs/graphql";



@ObjectType()
export class Display {
  @Field(() => Int)
  room: number;

  @Field(() => Int)
  feed: number;

  @Field(() => Int)
  display: string;
}