import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Image } from "src/images/image.model";

@ObjectType()
export class Deal {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  vendorId: number;

  @Field()
  name: string;

  @Field()
  detail: string;

  @Field()
  quantity: number;
  
  @Field()
  price: number;

  // @Field()
  // discountPrice: number;

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