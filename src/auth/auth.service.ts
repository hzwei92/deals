import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import * as twilio from 'twilio';
import * as bcrypt from 'bcrypt';
import TokenPayload from './tokenPayload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  client: twilio.Twilio;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

    const accessToken = this.getAccessToken(mobile);
    const refreshToken = await this.getRefreshToken(mobile, false);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user = await this.usersService.getUserIfRefreshTokenMatches(payload.mobile, token);
      if (!user) {
        throw new BadRequestException('Invalid refresh token');
      }
      return this.getAccessToken(user.mobile);
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new BadRequestException('Invalid refresh token');
      }
      throw error;
    }
  }

  getAccessToken(mobile: string) {
    const payload: TokenPayload = { mobile };
		const expirationTime = this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${expirationTime}s`
    });

    return token;
  }

  async getRefreshToken(mobile: string, shouldTokenExpire: boolean) {
    const payload: TokenPayload = { mobile };
		const expirationTime = this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: shouldTokenExpire 
        ? `${expirationTime}s`
        : '9999 years',
    });
    await this.usersService.setRefreshToken(mobile, token);

    return token;
  }
}
