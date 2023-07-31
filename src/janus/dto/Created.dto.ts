import { Field, Int, ObjectType } from "@nestjs/graphql";


@ObjectType()
export class Created {
  @Field(() => Int)
  room: number;

  @Field()
  permanent: boolean;
}