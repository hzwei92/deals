import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Image {
  @Field(() => Int)
  id: number;

  @Field()
  data: string; // base4 string

  @Field()
  createdAt: Date;

  @Field()
  deletedAt: Date;
}