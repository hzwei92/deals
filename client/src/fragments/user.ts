import { gql } from "@apollo/client";

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    email
    phone
    name
    isAdmin
    isCamOn
    isMicOn
    isSoundOn
    lng
    lat
    zoom
    activeChannelId
  }
`;
