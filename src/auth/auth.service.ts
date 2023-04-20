import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import * as twilio from 'twilio';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  client: twilio.Twilio;
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

    console.log(accountSid, authToken);
    this.client = twilio(accountSid, authToken);
  }

  async login(mobile: string) {
    const code = Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
    console.log(code);

    await this.usersService.setVerificationCode(mobile, code);
      
    this.client.messages
      .create({
        from: '+17257264123',
        to: '+1' + mobile,
        body: `Your login verification code for JAMN Deals is: ${code}`,
      })
      .then(message => console.log(message.sid));
  }

  async verify(mobile: string, code: string) {
    const user = await this.usersService.findOne(mobile);

    if (!user) {
      throw new Error('User not found');
    }

    const isCodeValid = await bcrypt.compare(code, user.hashedVerificationCode);

    if (!isCodeValid) {
      throw new Error('Invalid verification code');
    }

    await this.usersService.setVerificationCode(mobile, null);

    return user;
  }
}
