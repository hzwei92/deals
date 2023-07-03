import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true, where: '"deletedAt" IS NULL'})
  @Column()
  phone: string;

  @Index({ unique: true, where: '"deletedAt" IS NOT NULL AND name IS NOT NULL' })
  @Column({ nullable: true })
  name?: string;

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