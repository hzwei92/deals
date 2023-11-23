import { gql } from "@apollo/client";

export const CHANNEL_FIELDS = gql`
  fragment ChannelFields on Channel {
    id
    name
    detail
    lat
    lng
    memberCount
    activeUserCount
    createdAt
    updatedAt
    deletedAt
  }
`;