
export type User = {
  id: number;
  email?: string;
  phone?: string;
  name: string;
  isAdmin: boolean;
  isCamOn: boolean;
  isMicOn: boolean;
  isSoundOn: boolean;
  activeChannelId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}