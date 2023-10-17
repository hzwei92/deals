
import { Channel } from "./Channel";
import { User } from "./User";

export type Membership = {
  id: number;
  channelId: number;
  channel?: Channel;
  userId: number;
  user?: User;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
};