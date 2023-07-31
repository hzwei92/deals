import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Allowed {
  @Field(() => [String])
  list: string[];
}