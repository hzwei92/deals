
export type User = {
  id: number;
  email?: string;
  phone?: string;
  name?: string;
  isAdmin: boolean;
  liveChannelId: number;
}