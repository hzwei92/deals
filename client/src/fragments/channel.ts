import { gql } from "@apollo/client";

export const CHANNEL_FIELDS = gql`
  fragment ChannelFields on Channel {
    id
    name
    detail
    ownerId
    lat
    lng
    activeUserCount
    createdAt
    updatedAt
    deletedAt
  }
`;