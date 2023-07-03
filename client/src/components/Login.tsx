import { gql, useMutation } from "@apollo/client";
import { IonButton, IonContent, IonInput } from "@ionic/react"
import { useContext, useState } from "react";
import { AppContext } from "../App";

const LOGIN = gql`
  mutation Login($phone: String!) {
    login(phone: $phone) {
      id
      phone
      isAdmin
    }
  }
`;

const Login = () => {
  const { 
    setPhone, 
    setIsVerified,
  } = useContext(AppContext);

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
        setPhone(data.login.phone);
        setIsVerified(false);
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

  const onLogin = () => {
    setIsLoading(true);

    const tel1 = tel.replace(/[^0-9]/g, '');
    login({ variables: { phone: tel1 } });
  }

  return (
    <IonContent fullscreen>
    <div style={{
      padding: 20,
    }}>
      Enter your phone number to login.
      <div style={{
        marginTop: 5,
      }}>
        A text message will be sent to you with a verification code.
      </div>
      <div style={{
        display: 'flex',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          +1&nbsp; 
        </div>
      <IonInput
        type={'tel'} 
        placeholder='888 888 8888' 
        onIonInput={onInput}
        value={tel}
      />
      </div>
      <IonButton disabled={!telIsValid || isLoading} onClick={onLogin}>
        {
          isLoading 
            ? 'Loading...'
            : 'Login'
        }
      </IonButton>
    </div>
  </IonContent>
  )
}

export default Login;
