import { gql, useMutation } from "@apollo/client";
import { IonButton, IonButtons, IonContent, IonInput } from "@ionic/react"
import { useState } from "react";
import { useAppDispatch } from "../store";
import { User } from "../types/User";

const LOGIN = gql`
  mutation Login($phone: String!) {
    login(phone: $phone) {
      id
      phone
      isAdmin
    }
  }
`;

interface LoginStartProps {
  setPendingUser: (user: User | null) => void;
};
const LoginStart: React.FC<LoginStartProps> = ({ setPendingUser }) => {
  const dispatch = useAppDispatch();

  const [tel, setTel] = useState<string>('');
  const [telIsValid, setTelIsValid] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const [login] = useMutation(LOGIN, {
    onError: (err) => {
      console.log(err);

      setIsLoading(false);
    },
    onCompleted: (data) => {
      console.log(data);

      setIsLoading(false);

      if (data.login.id) {  
        setTel('');
        setPendingUser(data.login);
      }
    }
  });

  const onInput = (e: Event) => {
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

  const onPhoneInput = () => {
    setIsLoading(true);

    const tel1 = tel.replace(/[^0-9]/g, '');
    login({ variables: { phone: tel1 } });
  }

  return (
    <IonContent fullscreen>
    <div style={{
      padding: 20,
    }}>
      Enter your <b>phone number</b> to login.
      <div style={{
        marginTop: 30,
      }}>
        A text message will be sent to you with a verification code.
      </div>
      <div style={{
        marginTop: 30,
        display: 'flex',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: 24,
          paddingRight: 10,
        }}>
          +1
        </div>
        <div style={{
          display: 'flex',
          padding: 5,
          paddingLeft: 10,
          border: '1px solid',
          borderRadius: 5,

        }}>
          <IonInput
            type={'tel'} 
            placeholder='888 888 8888' 
            onIonInput={onInput}
            value={tel}
            style={{
              fontSize: 24,
            }}
          />
        </div>
      </div>
      <IonButtons style={{
        marginTop: 30,
      }}>
        <IonButton disabled={!telIsValid || isLoading} onClick={onPhoneInput} style={{
          border: '1px solid',
          borderRadius: 5,
          fontSize: 24,
          fontWeight: 'bold',
          height: 50,
        }}>
          <span style={{
            padding: 10,
          }}>
            {
              isLoading 
                ? 'LOADING...'
                : 'LOGIN'
            }
          </span>
        </IonButton>
      </IonButtons>
    </div>
  </IonContent>
  )
}

export default LoginStart;
