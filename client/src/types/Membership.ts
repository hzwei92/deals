
import { Channel } from "./Channel";
import { User } from "./User";

export type Membership = {
  id: number;
  channelId: number;
  channel?: Channel;
  userId: number;
  user?: User;
  isOwner: boolean;
  isSaved: boolean;
  isActive: boolean;
  lastVisitedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};