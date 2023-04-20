import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(mobile: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ mobile })
  }

  async createOne(mobile: string): Promise<User> {
    const user = new User();
    user.mobile = mobile.trim();
    return this.usersRepository.save(user);
  }

  async setVerificationCode(mobile: string, code: string | null): Promise<User> {
    const user = await this.findOne(mobile);
    if (!user) throw new Error('User not found');  

    if (code == null) {
      user.hashedVerificationCode = null;
    }
    else {
      user.hashedVerificationCode = await bcrypt.hash(code, 10);
    }
    
    return this.usersRepository.save(user);
  }
}

