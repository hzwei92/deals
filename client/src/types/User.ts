
export type User = {
  id: number;
  email?: string;
  phone?: string;
  name: string;
  isAdmin: boolean;
  activeChannelId: number;
}