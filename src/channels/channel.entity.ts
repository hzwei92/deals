import { Membership } from "src/memberships/membership.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @ManyToOne(() => User, user => user.channels)
  owner: User;

  @OneToMany(() => Membership, membership => membership.channel)
  memberships: Membership[];

  @Column({ default: 'New Channel' })
  name: string;

  @Column({ default: '' })
  detail: string;

  @Column({ type: 'double precision', default: 0 })
  lng: number;

  @Column({ type: 'double precision', default: 0 })
  lat: number;

  @Column({ type: 'int', default: 1 })
  memberCount: number;
  
  @Column({ type: 'int', default: 0 })
  activeUserCount: number; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}