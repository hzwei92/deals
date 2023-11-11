import { IonButton, IonButtons, IonContent, IonIcon, IonInput } from "@ionic/react"
import { useContext, useState } from "react";
import { User } from "../types/User";
import { GoogleLogin } from "@react-oauth/google";
import useLoginByGoogle from "../hooks/useLoginByGoogle";
import FacebookLogin from "react-facebook-login";
import { FACEBOOK_APP_ID } from "../constants";
import { AppContext } from "../App";
import useLoginByFacebook from "../hooks/useLoginByFacebook";
import { send } from "ionicons/icons";
import useLoginByEmail from "../hooks/useLoginByEmail";


interface LoginStartProps {
  setPendingUser: (user: User | null) => void;
};
const LoginStart: React.FC<LoginStartProps> = ({ setPendingUser }) => {
  const [email, setEmail] = useState<string>('');
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const { authModal } = useContext(AppContext);

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
    <IonContent fullscreen>
    <div style={{
      padding: 30,
      paddingTop: 0,
    }}>
      <div style={{
        textAlign: 'center'
      }}>
        Choose your preferred login method:
      </div>
      <div style={{
        marginBottom: 30,
        paddingTop: 30,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{
          paddingLeft: 10,
          border: '1px solid',
          borderRadius: 5,
          margin: 'auto',
          width: 240,
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
        <GoogleLogin 
          onSuccess={credentialResponse => {
            console.log(credentialResponse);
            googleAuth(credentialResponse.credential);
          }}
          onError={() => {
            console.log('Login failed');
          }}
          useOneTap={false}
          text={'continue_with'}
          width={220}
        />
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: 30,
      }}>
        <FacebookLogin 
          appId={FACEBOOK_APP_ID}
          autoLoad={false}
          fields="name,email,picture"
          scope="public_profile, email"
          textButton="Continue with Facebook"
          disableMobileRedirect={true}
          onClick={() => {}}
          callback={(response: any) => {
            console.log(response);
            facebookAuth(response.accessToken);
          }}
          buttonStyle={{
            width: 260,
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
