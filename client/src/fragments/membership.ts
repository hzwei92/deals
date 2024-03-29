import { gql } from "@apollo/client";

export const MEMBERSHIP_FIELDS = gql`
  fragment MembershipFields on Membership {
    id
    channelId 
    userId
    isOwner
    isSaved
    isActive
    lastVisitedAt
    createdAt
    updatedAt
    deletedAt
  }
`;