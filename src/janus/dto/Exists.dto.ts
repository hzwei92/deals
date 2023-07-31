import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Exists {
  @Field(() => Int)
  room: number;

  @Field()
  exists: boolean;
}