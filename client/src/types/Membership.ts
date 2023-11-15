
import { Channel } from "./Channel";
import { User } from "./User";

export type Membership = {
  id: number;
  channelId: number;
  channel?: Channel;
  userId: number;
  user?: User;
  savedIndex: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};