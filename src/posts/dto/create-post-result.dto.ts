import { Field, ObjectType } from "@nestjs/graphql";
import { Post } from "../post.model";
import { Membership } from "src/memberships/membership.model";

@ObjectType()
export class CreatePostResult {
  @Field(() => Post)
  post: Post;

  @Field(() => Membership)
  membership: Membership;
}
