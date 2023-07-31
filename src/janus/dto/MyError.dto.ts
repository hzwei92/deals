import { Field, ObjectType } from "@nestjs/graphql";


@ObjectType()
export class MyError {
  @Field()
  error: string;

  @Field({ nullable: true })
  request: string;
}