import { PushNotifications } from '@capacitor/push-notifications';
import { useEffect } from 'react';
import { useAppSelector } from '../store';
import { selectAppUser } from '../slices/userSlice';
import useAddDevice from './useAddDevice';
import { isPlatform } from '@ionic/react';

const usePushNotifications = () => {
  const addDevice = useAddDevice();

  const addListeners = async () => {
    await PushNotifications.addListener('registration', token => {
      console.info('Registration token: ', token.value);
      addDevice(token.value);
    });

    await PushNotifications.addListener('registrationError', err => {
      console.error('Registration error: ', err.error);
    });

    await PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Push notification received: ', notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
    });
  }

  const registerNotifications = async () => {
    let permStatus = await PushNotifications.checkPermissions();
    console.log('permStatus', permStatus)

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    await PushNotifications.register();
  }

  const getDeliveredNotifications = async () => {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('delivered notifications', notificationList);
  }

  const user = useAppSelector(selectAppUser);

  useEffect(() => {
    if (isPlatform('ios') && !isPlatform('mobileweb')) {
      addListeners();
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    if (isPlatform('ios') && !isPlatform('mobileweb')) {
      registerNotifications();
    }
  }, [user?.id]);
}

export default usePushNotifications;