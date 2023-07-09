import { IonHeader, IonModal } from '@ionic/react';
import { useEffect, useState } from 'react';
import { selectAppUser } from '../slices/userSlice';
import { useAppSelector } from '../store';
import LoginStart from './LoginStart';
import LoginFinish from './LoginFinish';
import { selectIsInitialized } from '../slices/authSlice';
import { User } from '../types/User';
import useToken from '../hooks/usetoken';

const AuthModal: React.FC = () => {
  const user = useAppSelector(selectAppUser);
  const isInitialized = useAppSelector(selectIsInitialized);
  const { refreshToken, refreshTokenInterval } = useToken();
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    if (isInitialized) {
      if (user) {
        refreshTokenInterval();
      }
    }
    else {
      console.log('initializing');
      refreshToken();
    }
  }, [isInitialized]);

  return (
    <IonModal isOpen={isInitialized && !user} backdropDismiss={false}>
      <IonHeader style={{
        fontWeight: 'bold',
        fontSize: 40,
        margin: 20,
      }}>
        JAMN
      </IonHeader>
      {
        !pendingUser
          ? <LoginStart setPendingUser={setPendingUser} />
          : <LoginFinish pendingUser={pendingUser} setPendingUser={setPendingUser} />   
      }
    </IonModal>
  );
};

export default AuthModal;
