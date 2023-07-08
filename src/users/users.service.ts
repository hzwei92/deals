import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private stripeService: StripeService,
  ) {}

  async findOne(phone: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ phone })
  }

  async createOne(phone: string): Promise<User> {
    phone = phone.trim();
    const stripeCustomer = await this.stripeService.createCustomer(phone);
 
    const user = await this.usersRepository.create({
      phone,
      stripeCustomerId: stripeCustomer.id,
    })

    return this.usersRepository.save(user);
  }
  
  async setVerificationCode(phone: string, code: string | null): Promise<User> {
    const user = await this.findOne(phone);
    if (!user) throw new Error('User not found');  

    if (code == null) {
      user.hashedVerificationCode = null;
    }
    else {
      user.hashedVerificationCode = await bcrypt.hash(code, 10);
    }

    return this.usersRepository.save(user);
  }

  async setRefreshToken(phone: string, token: string): Promise<User> {
    const user = await this.findOne(phone);
    if (!user) throw new Error('User not found');

    if (token == null) {
      user.hashedRefreshToken = null;
    }
    else {
      user.hashedRefreshToken = await bcrypt.hash(token, 10);
    }

    return this.usersRepository.save(user);
  }

  async getUserIfRefreshTokenMatches(phone: string, refreshToken: string): Promise<User | null> {
    const user = await this.findOne(phone);
    if (!user) throw new Error('User not found');

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

    if (isRefreshTokenValid) {
      return user;
    }
    else {
      return null;
    }
  }
}
