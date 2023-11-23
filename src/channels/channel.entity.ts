import { Membership } from "src/memberships/membership.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Membership, membership => membership.channel)
  memberships: Membership[];

  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  url: string;

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