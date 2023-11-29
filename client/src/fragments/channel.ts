import { gql } from "@apollo/client";

export const CHANNEL_FIELDS = gql`
  fragment ChannelFields on Channel {
    id
    name
    url
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