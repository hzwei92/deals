import { Channel } from "src/channels/channel.entity";
import { Deal } from "src/deals/deal.entity";
import { Membership } from "src/memberships/membership.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true, where: '"deletedAt" IS NULL AND email IS NOT NULL' })
  @Column({ nullable: true })
  email?: string;

  @Index({ unique: true, where: '"deletedAt" IS NULL AND phone IS NOT NULL' })
  @Column({ nullable: true })
  phone?: string;

  @Index({ unique: true, where: '"deletedAt" IS NOT NULL' })
  name: string;

  @OneToMany(() => Channel, channel => channel.owner)
  channels: Channel[];

  @OneToMany(() => Deal, deal => deal.vendor)
  offers: Deal[];
  
  @OneToMany(() => Membership, membership => membership.user)
  memberships: Membership[];

  @Column({ nullable: true })
  activeChannelId: number;

  @OneToOne(() => Channel)
  activeChannel: Channel;

  @Column({ default: false })
  isAdmin: boolean;

  @Column()
  stripeCustomerId: string;

  @Column({ nullable: true })
  hashedVerificationCode: string;

  @Column({ nullable: true })
  hashedRefreshToken: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}