import { Membership } from "./Membership";
import { Post } from "./Post";
import { User } from "./User";

export type Channel = {
  id: number;
  ownerId: number;
  owner: User;
  name: string;
  detail: string;
  lng: number;
  lat: number;
  memberships?: Membership[];
  posts?: Post[];
  memberCount: number;
  activeUserCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};