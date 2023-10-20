import { gql } from "@apollo/client";

export const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    channelId 
    userId
    text
    createdAt
    updatedAt
    deletedAt
  }
`;