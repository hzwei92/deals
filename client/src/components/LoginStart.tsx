import { gql, useMutation } from "@apollo/client";
import { IonButton, IonButtons, IonContent, IonIcon, IonInput } from "@ionic/react"
import { useContext, useState } from "react";
import { User } from "../types/User";
import { GoogleLogin } from "@react-oauth/google";
import useGoogleAuth from "../hooks/useGoogleAuth";
import FacebookLogin from "react-facebook-login";
import { FACEBOOK_APP_ID } from "../constants";
import { AppContext } from "../App";
import useFacebookAuth from "../hooks/useFacebookAuth";
import { USER_FIELDS } from "../fragments/user";
import { send } from "ionicons/icons";

const PHONE_LOGIN = gql`
  mutation phoneLogin($phone: String!) {
    phoneLogin(phone: $phone) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

const EMAIL_LOGIN = gql`
  mutation emailLogin($email: String!) {
    emailLogin(email: $email) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

interface LoginStartProps {
  setPendingUser: (user: User | null) => void;
};
const LoginStart: React.FC<LoginStartProps> = ({ setPendingUser }) => {
  const [email, setEmail] = useState<string>('');
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);

  const [tel, setTel] = useState<string>('');
  const [telIsValid, setTelIsValid] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const { authModal } = useContext(AppContext);

  const googleAuth = useGoogleAuth();

  const facebookAuth = useFacebookAuth();

  const [emailLogin] = useMutation(EMAIL_LOGIN, {
    onError: (err) => {
      console.log(err);
      setIsLoading(false);
    },
    onCompleted: (data) => {
      console.log(data);

      setIsLoading(false);

      if (data.emailLogin.id) {
        setEmail('');
        setTel('');
        setPendingUser(data.emailLogin);
      }
    },
  });

  const [phoneLogin] = useMutation(PHONE_LOGIN, {
    onError: (err) => {
      console.log(err);
      setIsLoading(false);
    },
    onCompleted: (data) => {
      console.log(data);

      setIsLoading(false);

      if (data.phoneLogin.id) {  
        setEmail('');
        setTel('');
        setPendingUser(data.phoneLogin);
      }
    }
  });

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

  const onPhoneInput = (e: Event) => {
    const val = (e.target as HTMLIonInputElement).value as string;

    setTel(val);
    
    const telRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    
    if (telRegex.test(val)) {
      setTelIsValid(true);
    }
    else {
      setTelIsValid(false);
    }
  }

  const onEmailSubmit = () => {
    setIsLoading(true);

    const email1 = email.trim();
    emailLogin({ variables: { email: email1 } });
  }

  const onPhoneSubmit = () => {
    setIsLoading(true);

    const tel1 = tel.replace(/[^0-9]/g, '');
    phoneLogin({ variables: { phone: tel1 } });
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
      <IonButtons style={{
        marginBottom: 40,
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
      <div style={{
        textAlign: 'center'
      }}>
        Choose your preferred login method:
      </div>
      <div style={{
        marginTop: 30,
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
          display: 'flex',
        }}>
          <IonInput
            type={'tel'} 
            placeholder='888-888-8888' 
            onIonInput={onPhoneInput}
            clearInput={true}
            value={tel}
          />
          <IonButtons>
            <IonButton disabled={!telIsValid || isLoading} onClick={onPhoneSubmit}>
              <IonIcon icon={send} size='small' />
            </IonButton>
          </IonButtons>
        </div>
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
        />
      </div>
    </div>
  </IonContent>
  )
}

export default LoginStart;
