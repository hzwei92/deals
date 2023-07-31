import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Destroyed {
  @Field(() => Int)
  room: number;

  @Field()
  permanent: boolean;
}