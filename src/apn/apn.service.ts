import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const apn = require('apn');

@Injectable()
export class ApnService {
  apnProvider;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.apnProvider = new apn.Provider({
      token: {
        key: configService.get('NODE_ENV') === 'production' 
          ? configService.get('APN_KEY').replace(/\\n/g, '\n')
          : configService.get('APN_KEY'),
        keyId: configService.get('APN_KEY_ID'),
        teamId: configService.get('APN_TEAM_ID'),
      },
      production: false,
    });
  }

  async sendNotification(deviceToken: string, payload: any) {
    const notification = new apn.Notification();
    notification.topic = 'com.example.app';
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    notification.badge = 1;
    notification.sound = 'ping.aiff';
    notification.alert = 'Hello World \uD83C\uDF10';
    notification.payload = payload;
    notification.pushType = 'alert';
    notification.topic = 'com.example.app';
    return this.apnProvider.send(notification, deviceToken);
  }
}
