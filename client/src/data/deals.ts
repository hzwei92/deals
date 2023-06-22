export interface Deal {
  name: string;
  detail: string;
  id: number;
  price: number;
  discountPrice: number;
  image: Image;
}

export interface Image {
  id: number;
  data: string;
}