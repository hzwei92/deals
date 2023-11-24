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
        key: configService.get('APN_KEY').replace(/\\n/g, '\n'),
        keyId: configService.get('APN_KEY_ID'),
        teamId: configService.get('APN_TEAM_ID'),
      },
      production: false,
    });
  }

  async sendNotification(deviceToken: string, payload: any) {
    console.log('sending notification to ', deviceToken)
    const notification = new apn.Notification();
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    notification.badge = 1;
    notification.sound = 'ping.aiff';
    notification.alert = payload
    notification.pushType = 'alert';
    notification.topic = 'io.jamn';
    return this.apnProvider.send(notification, deviceToken)
      .then((result) => {
        console.log(result);
        result.failed.forEach((failure) => {
          console.error(failure.response);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
