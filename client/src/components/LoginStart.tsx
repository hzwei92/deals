import { IonButton, IonButtons, IonContent, IonIcon, IonInput, isPlatform } from "@ionic/react"
import { useContext, useEffect, useState } from "react";
import { User } from "../types/User";
import { GoogleLogin } from "@react-oauth/google";
import useLoginByGoogle from "../hooks/useLoginByGoogle";
import FacebookLogin from "react-facebook-login";
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID, IOS_GOOGLE_CLIENT_ID } from "../constants";
import { AppContext } from "../App";
import useLoginByFacebook from "../hooks/useLoginByFacebook";
import { logoGoogle, send } from "ionicons/icons";
import useLoginByEmail from "../hooks/useLoginByEmail";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

interface LoginStartProps {
  setPendingUser: (user: User | null) => void;
};
const LoginStart: React.FC<LoginStartProps> = ({ setPendingUser }) => {
  const [email, setEmail] = useState<string>('');
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const { authModal } = useContext(AppContext);

  useEffect(() => {
    const clientId = isPlatform('ios') && !isPlatform('mobileweb') ? IOS_GOOGLE_CLIENT_ID : GOOGLE_CLIENT_ID;
    GoogleAuth.initialize({
      clientId,
      scopes: ['email'],
    });
  }, [])

  const googleAuth = useLoginByGoogle();
  const facebookAuth = useLoginByFacebook();

  const completeLogin = (user: User) => {
    setIsLoading(false);
    if (user?.id) {
      setEmail('');
      setPendingUser(user);
    }
  }
  const emailLogin = useLoginByEmail(completeLogin);

  const onEmailInput = (e: Event) => {
    const val = (e.target as HTMLIonInputElement).value as string;

    setEmail(val);

    const emailRegex = /\S+@\S+\.\S+/;

    if (emailRegex.test(val)) {
      setEmailIsValid(true);
    }
    else {
      setEmailIsValid(false);
    }
  }

  const onEmailSubmit = () => {
    setIsLoading(true);

    const email1 = email.trim();
    emailLogin(email1);
  }

  const handleBack = () => {
    authModal.current?.dismiss();
  }

  return (
    <IonContent>
    <div style={{
    }}>
      <div style={{
        textAlign: 'center'
      }}>
        Choose your preferred login method:
      </div>
      <div style={{
        marginBottom: 20,
        paddingTop: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{
          paddingLeft: 10,
          border: '1px solid',
          borderRadius: 5,
          margin: 'auto',
          width: 250,
          display: 'flex'
        }}>
          <IonInput
            type={'email'} 
            placeholder='email@domain.com' 
            clearInput={true}
            onIonInput={onEmailInput}
            value={email}
          />
          <IonButtons>
            <IonButton disabled={!emailIsValid || isLoading} onClick={onEmailSubmit}>
              <IonIcon icon={send} size='small' />
            </IonButton>
          </IonButtons>
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <IonButtons>
          <IonButton style={{
            width: 250,
            height: 45,
            backgroundColor: 'dimgrey',
            color: 'white',
            borderRadius: 5,
          }} onClick={() => {
            GoogleAuth.signIn().then((response: any) => {
              console.log(response);
              googleAuth(response.authentication.idToken);
            }).catch((error: any) => {
              console.log(error);
            });
          }}>
            Google
          </IonButton>
        </IonButtons>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: 20,
      }}>
        <FacebookLogin 
          appId={FACEBOOK_APP_ID}
          autoLoad={false}
          fields="name,email,picture"
          scope="public_profile, email"
          textButton="Facebook"
          disableMobileRedirect={true}
          onClick={() => {}}
          callback={(response: any) => {
            console.log(response);
            facebookAuth(response.accessToken);
          }}
          buttonStyle={{
            width: 250,
            borderRadius: 5,
          }}
        />
      </div>
    </div>
    <IonButtons style={{
      margin: 20,
    }}>
      <IonButton onClick={handleBack} style={{
        border: '1px solid',
        borderRadius: 5,
        fontSize: 20,
        fontWeight: 'bold',
        height: 40,
      }}>
        <span style={{
          padding: 10,
        }}>
          BACK
        </span>
      </IonButton>
    </IonButtons>
  </IonContent>
  )
}

export default LoginStart;
