import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @ManyToOne(() => User, user => user.offers)
  owner: User;

  @Column({ default: 'New Channel' })
  name: string;

  @Column({ default: '' })
  detail: string;

  @Column({ type: 'double precision', default: 0 })
  lng: number;

  @Column({ type: 'double precision', default: 0 })
  lat: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}