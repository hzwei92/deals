import { IonContent, IonHeader, IonModal, isPlatform } from '@ionic/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { selectAppUser } from '../slices/userSlice';
import { useAppSelector } from '../store';
import LoginStart from './LoginStart';
import LoginFinish from './LoginFinish';
import { selectIsInitialized } from '../slices/authSlice';
import { User } from '../types/User';
import useToken from '../hooks/useToken';
import { AppContext } from '../App';

const AuthModal: React.FC = () => {
  const { 
    authModal,
  } = useContext(AppContext);

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
    <IonModal trigger='auth-modal-button' ref={authModal}>
      <div style={{
        fontWeight: 'bold',
        fontSize: 40,
        padding: 20,
        paddingTop: isPlatform('ios') && !isPlatform('mobileweb') ? 70 : 20,
        color: 'inherit'
      }}>
        LOG IN
      </div>
      {
        !pendingUser
          ? <LoginStart setPendingUser={setPendingUser} />
          : <LoginFinish pendingUser={pendingUser} setPendingUser={setPendingUser} />   
      }
    </IonModal>
  );
};

export default AuthModal;
