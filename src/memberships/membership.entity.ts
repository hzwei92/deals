import { Channel } from "src/channels/channel.entity";
import { Image } from "src/images/image.entity";
import { Order } from "src/orders/order.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channelId: number;

  @ManyToOne(() => Channel, channel => channel.memberships)
  channel: Channel;

  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.memberships)
  user: User;

  // if null, then not saved; otherwise, the index of the saved membership
  @Column({ nullable: true })
  savedIndex: number; 
  
  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}