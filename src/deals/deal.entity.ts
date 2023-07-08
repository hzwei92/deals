import { Image } from "src/images/image.entity";
import { Order } from "src/orders/order.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Deal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vendorId: number;

  @ManyToOne(() => User, user => user.offers)
  vendor: User;

  @OneToMany(() => Order, order => order.deal)
  orders: Order[];

  @Column()
  name: string;

  @Column()
  detail: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  // @Column()
  // discountPartySize: number;
  
  // @Column()
  // discountPrice: number;

  @Column()
  imageId: number;

  @OneToOne(() => Image)
  @JoinColumn({ referencedColumnName: 'id' })
  image: Image;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}