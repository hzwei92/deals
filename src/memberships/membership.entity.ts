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

  @Column({ default: false })
  isOwner: boolean;

  @Column({ default: false })
  isSaved: boolean;

  // if true, then the user is live in the channel video call
  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  lastVisitedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}