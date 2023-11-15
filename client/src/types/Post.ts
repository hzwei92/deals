
import { Channel } from "./Channel";
import { User } from "./User";

export type Post = {
  id: number;
  channelId: number;
  channel?: Channel;
  userId: number;
  user?: User;
  text: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};