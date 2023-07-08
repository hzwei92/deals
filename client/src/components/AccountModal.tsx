import { Preferences } from '@capacitor/preferences';
import { IonButton, IonButtons, IonContent, IonHeader, IonModal } from '@ionic/react';
import { useRef } from 'react';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants';
import { selectInterval, setRefreshInterval } from '../slices/authSlice';
import { selectAppUser, setAppUserId } from '../slices/userSlice';
import { useAppDispatch, useAppSelector } from '../store';

const AccountModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAppUser);
  const interval = useAppSelector(selectInterval);

  const handleLogout = async () => {
    modal.current?.dismiss();

    if (interval) {
      clearInterval(interval);
      dispatch(setRefreshInterval(null));
    }
    
    await Preferences.remove({ key: ACCESS_TOKEN_KEY });
    await Preferences.remove({ key: REFRESH_TOKEN_KEY });

    dispatch(setAppUserId(null));
  }

  const handleBack = () => {
    modal.current?.dismiss();
  }

  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonModal ref={modal} trigger={'account-modal-button'}>
      <IonHeader style={{
        fontWeight: 'bold',
        fontSize: 40,
        margin: 20,
      }}> 
        +1 { user?.phone.slice(0, 3) } { user?.phone.slice(3, 6) } { user?.phone.slice(6-10) }
      </IonHeader>
      <IonContent>
        <IonButtons style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          margin: 20,
        }}>
          <IonButton onClick={handleLogout} style={{
            fontWeight: 'bold',
            fontSize: 24,
            border: '1px solid',
            borderRadius: 5,  
            height: 50,
          }}>
            LOGOUT
          </IonButton>
          <IonButton onClick={handleBack} style={{
            fontWeight: 'bold',
            fontSize: 24,
            border: '1px solid',
            borderRadius: 5,  
            height: 50,
            marginTop: 10,
          }}>
            BACK
          </IonButton>
        </IonButtons>
      </IonContent>
    </IonModal>
  );
};

export default AccountModal;
