import { Preferences } from '@capacitor/preferences';
import { IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonModal, isPlatform } from '@ionic/react';
import { useRef, useState } from 'react';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants';
import { selectInterval, setRefreshInterval } from '../slices/authSlice';
import { selectAppUser, setAppUserId } from '../slices/userSlice';
import { useAppDispatch, useAppSelector } from '../store';
import useLogout from '../hooks/useLogout';
import useChangeName from '../hooks/useChangeName';
import md5 from 'md5';


const AccountModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAppUser);
  const interval = useAppSelector(selectInterval);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const changeName = useChangeName();
  const logout = useLogout();

  const handleLogout = async () => {
    modal.current?.dismiss();

    logout();
    
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

  const handleProfileEdit = () => {
    if (!user) return;
    setName(user.name);
    setIsEditingProfile(true);
  }

  const handleProfileSave = () => {
    console.log('handleProfileSave', name);
    changeName(name);
    setIsEditingProfile(false);
  }

  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonModal ref={modal} trigger={'account-modal-button'}>
      <IonHeader style={{
        margin: 20,
        fontWeight: 'bold',
        fontSize: 40,
        marginTop: isPlatform('ios') && !isPlatform('mobileweb') ? 70 : 20,
      }}> 
        MY ACCOUNT
      </IonHeader>
      <IonContent>
        <div style={{
          margin: 20,
          fontSize: 24,
          fontWeight: 'bold',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
        }}>
          PROFILE&nbsp;
          <IonButtons style={{
          }}>
            <IonButton onClick={handleProfileEdit} style={{
              border: '1px solid',
              borderRadius: 5,
              display: isEditingProfile ? 'none' : 'block',
            }}>
              EDIT
            </IonButton>
            <IonButton onClick={handleProfileSave} style={{
              border: '1px solid',
              borderRadius: 5,
              display: isEditingProfile ? 'block' : 'none',
            }}>
              SAVE
            </IonButton>
            <IonButton onClick={() => setIsEditingProfile(false)} style={{
              border: '1px solid',
              borderRadius: 5,
              display: isEditingProfile ? 'block' : 'none',
            }}>
              CANCEL
            </IonButton>
          </IonButtons>
        </div>
        <div style={{
          marginLeft: 30,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <IonAvatar>
                <img style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                }} src={`https://www.gravatar.com/avatar/${md5(user?.email ?? '')}?d=retro`}/>
              </IonAvatar>
            </div>
            <div style={{
              marginLeft: 20,
              display: isEditingProfile ? 'none' : 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              fontSize: 22,
            }}>
              { user?.name }
            </div>
            <div style={{
              display: isEditingProfile ? 'flex' : 'none',
              marginLeft: 10,
              border: '1px solid',
              borderRadius: 5,
              paddingLeft: 10,
            }}>
              <IonInput value={name} clearInput={true} style={{
                display: isEditingProfile ? 'flex' : 'none',
                fontSize: 22,
              }} onIonInput={(e) => setName(e.detail.value || '')} />
            </div>
          </div>
          <div>
            
          </div>
        </div>
        <div style={{
          margin: 20,
          marginTop: 60,
          fontSize: 24,
          fontWeight: 'bold',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
        }}>
          CREDENTIALS&nbsp;
          <IonButtons style={{
          }}>
            <IonButton onClick={() => setIsEditingCredentials(true)} style={{
              border: '1px solid',
              borderRadius: 5,
              display: isEditingCredentials ? 'none' : 'block',
            }}>
              EDIT
            </IonButton>
          </IonButtons>
        </div>
        <div style={{
          display: 'flex',
        }}>
          <div style={{
            marginLeft: 30,
            width: 80,
            fontWeight: 'bold',
          }}>
            EMAIL
          </div>
          <div>
            { user?.email }
          </div>
        </div>
        <div style={{
          marginTop: 20,
          display: 'flex',
        }}>
          <div style={{
            marginLeft: 30,
            width: 80,
            fontWeight: 'bold',
          }}>
            PHONE
          </div>
          <div>
            { user?.phone }
          </div>
        </div>
        <IonButtons style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          margin: 20,
          marginTop: 60,
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
