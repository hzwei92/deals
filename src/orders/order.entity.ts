import { Deal } from "src/deals/deal.entity";
import { Image } from "src/images/image.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  purchaserId: number;

  @OneToOne(() => User, user => user.id)
  @JoinColumn({ referencedColumnName: 'id' })
  purchaser: User;
  
  @Column()
  dealId: number;

  @ManyToOne(() => Deal, deal => deal.orders)
  deal: Deal;

  @Column()
  detail: string;

  @Column()
  price: number;

  @Column({ default: false })
  isCompleted: boolean;

  // imageId for QR code
  @Column()
  imageId: number;

  // image for QR code
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