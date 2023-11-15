import { Image } from "./Image";
import { User } from "./User";

export type Deal = {
  id: number;
  vendorId: number;
  vendor: User;
  name: string;
  detail: string;
  quantity: number;
  price: number;
  imageId: number;
  image: Image;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};