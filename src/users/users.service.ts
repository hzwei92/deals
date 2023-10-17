import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { StripeService } from 'src/stripe/stripe.service';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private stripeService: StripeService,
  ) {}


  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findOneByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ phone })
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOneByName(name: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ name });
  }

  async createOne({phone, email}: {phone?: string, email?: string}): Promise<User> {
    if (!phone && !email) {
      throw new Error('Must provide either phone or email');
    }
    if (phone) {
      phone = phone.trim();
    }
    if (email) {
      email = email.trim();
    }
    const stripeCustomer = await this.stripeService.createCustomer({
      phone, 
      email
    });
 
    let name = null;
    let user0 = null;
    do {
      name = uniqueNamesGenerator({
        dictionaries: [animals],
        style: 'upperCase',
      }) + '-' + Math.random().toString().substring(2, 5);
  
      user0 = await this.findOneByName(name);
    } while (user0)


    const user = await this.usersRepository.create({
      phone,
      email,
      name,
      stripeCustomerId: stripeCustomer.id,
    })

    return this.usersRepository.save(user);
  }

  async setActiveChannelId(id: number, channelId: number | null) {
    const user = await this.findOne(id);
    if (!user) throw new Error('User not found')

    user.activeChannelId = channelId;

    return this.usersRepository.save(user);
  }
  
  async setVerificationCode(id: number, code: string | null): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new Error('User not found');  

    if (code == null) {
      user.hashedVerificationCode = null;
    }
    else {
      user.hashedVerificationCode = await bcrypt.hash(code, 10);
    }

    return this.usersRepository.save(user);
  }

  async setRefreshToken(id: number, token: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new Error('User not found');

    if (token == null) {
      user.hashedRefreshToken = null;
    }
    else {
      user.hashedRefreshToken = await bcrypt.hash(token, 10);
    }

    return this.usersRepository.save(user);
  }

  async getUserIfRefreshTokenMatches(id: number, refreshToken: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) throw new Error('User not found');

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

    if (isRefreshTokenValid) {
      return user;
    }
    else {
      return null;
    }
  }


  async changeName(user: User, name: string): Promise<User> {
    const user0 = await this.findOneByName(name);
    if (user0) {
      console.log(user0);
      throw new Error('Name already taken');
    }

    user.name = name;
    return this.usersRepository.save(user);
  }
}
