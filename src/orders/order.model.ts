import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Deal } from "src/deals/deal.model";
import { Image } from "src/images/image.model";
import { User } from "src/users/user.model";

@ObjectType()
export class Order {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  purchaserId: number;

  @Field(() => User)
  purchaser: User;

  @Field(() => Int)
  dealId: number;

  @Field(() => Deal)
  deal: Deal;

  @Field()
  detail: string;

  @Field()
  price: number;

  @Field()
  imageId: number;

  @Field(() => Image)
  image: Image;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  deletedAt: Date;
}