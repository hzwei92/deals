
export type User = {
  id: number;
  email?: string;
  phone?: string;
  name: string;
  isAdmin: boolean;
  isCamOn: boolean;
  isMicOn: boolean;
  isSoundOn: boolean;
  lng: number;
  lat: number;
  zoom: number;
  activeChannelId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}