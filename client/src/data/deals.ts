export interface Deal {
  name: string;
  detail: string;
  id: number;
  price: number;
  discountPrice: number;
}

const messages: Deal[] = [
  {
    name: 'New event: Trip to Vegas',
    detail: 'Las Vegas, Nevada',
    id: 0,
    price: 100, 
    discountPrice: 50,
  },
  {
    name: 'What So Not',
    detail: 'EDM!',
    id: 1,
    price: 40,
    discountPrice: 20,
  },
  {
    name: 'Badass breakfast burritoes',
    detail: 'Get em while they\'re hot',
    id: 2,
    price: 6,
    discountPrice: 4,
  },
  {
    name: 'Flying Lotus x Reggie Watts x Marc Rebillet',
    detail: 'improv music',
    id: 3,
    price: 40,
    discountPrice: 30,
  },
  {
    name: 'Techno Taco Tuesdays',
    detail: 'The trifecta is back at it again!',
    id: 4,
    price: 40,
    discountPrice: 30,
  },
];

export const getDeals = () => messages;

export const getDeal = (id: number) => messages.find(m => m.id === id);
