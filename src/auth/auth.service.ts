import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
const twilio = require('twilio');
const bcrypt = require('bcrypt');
import TokenPayload from './tokenPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { Twilio } from 'twilio';
import { User } from 'src/users/user.entity';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import mailgun from 'mailgun-js';

@Injectable()
export class AuthService {
  twilioClient: Twilio;
  googleOauthClient: OAuth2Client;

  mailgunClient: any;


  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

    this.twilioClient = twilio(accountSid, authToken);

    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    this.googleOauthClient = new OAuth2Client(clientId, clientSecret);

    this.mailgunClient = mailgun({
      apiKey: this.configService.get('MAILGUN_API_KEY'),
      domain: this.configService.get('MAILGUN_DOMAIN'),
    });
  }

  async facebookAuth(credential: string) {
    console.log(credential);
    const { data } = await axios({
      url: 'https://graph.facebook.com/me',
      method: 'get',
      params: {
        fields: ['email'].join(','),
        access_token: credential,
      }
    });
    console.log(data);
    const { email } = data;

    let user = await this.usersService.findOneByEmail(email);

    if (!user) {
      user = await this.usersService.createOne({email});
    }

    const accessToken = this.getAccessToken(user);
    const refreshToken = await this.getRefreshToken(user, false);

    return {
      user, 
      accessToken,
      refreshToken,
    };
  }


  async googleAuth(credential: string) {
    const ticket = await this.googleOauthClient.verifyIdToken({
      idToken: credential,
      audience: this.configService.get('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    console.log(payload);
    const { email } = payload

    let user = await this.usersService.findOneByEmail(email);

    if (!user) {
      user = await this.usersService.createOne({email});
    }

    const accessToken = this.getAccessToken(user);
    const refreshToken = await this.getRefreshToken(user, false);


    return {
      user,
      accessToken,
      refreshToken,
    }
  }


  async emailLogin(user: User) {
    const code = Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
    console.log(code);

    await this.usersService.setVerificationCode(user.id, code);
      
    this.mailgunClient.messages()
      .send({
        from: 'JAMN Deals <verify@jamn.io>',
        to: user.email,
        subject: `Email verifcation code: ${code}`,
        text: `Welcome to JAMN Deals! Your email verification code is: ${code}`,
      })
      .then(msg => console.log(msg))
      .catch(err => console.error(err));
  }


  async phoneLogin(user: User) {
    const code = Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
    console.log(code);

    await this.usersService.setVerificationCode(user.id, code);
      
    this.twilioClient.messages
      .create({
        from: '+17257264123',
        to: '+1' + user.phone,
        body: `Your login verification code for JAMN Deals is: ${code}`,
      })
      .then(message => console.log(message.sid))
      .catch(err => console.error(err));
  }

  async verify(id: number, code: string) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new Error('User not found');
    }

    const isCodeValid = await bcrypt.compare(code, user.hashedVerificationCode);

    if (!isCodeValid) {
      throw new Error('Invalid verification code');
    }

    await this.usersService.setVerificationCode(user.id, null);

    const accessToken = this.getAccessToken(user);
    const refreshToken = await this.getRefreshToken(user, false);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user = await this.usersService.getUserIfRefreshTokenMatches(payload.id, token);
      if (!user) {
        throw new BadRequestException('Invalid refresh token');
      }
      const accessToken = this.getAccessToken(user);
      return {
        user,
        accessToken,
      }
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new BadRequestException('Invalid refresh token');
      }
      throw error;
    }
  }

  getAccessToken(user: User) {
    const { id, phone, email } = user;
    const payload: TokenPayload = { id, phone, email };
		const expirationTime = this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${expirationTime}s`
    });

    return token;
  }

  async getRefreshToken(user: User, shouldTokenExpire: boolean) {
    const { id, phone, email } = user;
    const payload: TokenPayload = { id, phone, email };
		const expirationTime = this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: shouldTokenExpire 
        ? `${expirationTime}s`
        : '9999 years',
    });
    await this.usersService.setRefreshToken(id, token);

    return token;
  }
}
