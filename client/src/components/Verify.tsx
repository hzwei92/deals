import { gql, useMutation } from "@apollo/client";
import { Preferences } from "@capacitor/preferences";
import { IonButton, IonContent, IonInput, useIonRouter } from "@ionic/react"
import { useContext, useState } from "react";
import { AppContext } from "../App";
import { ACCESS_TOKEN_KEY, PHONE_KEY, REFRESH_TOKEN_KEY } from "../constants";
import useToken from "../hooks/useToken";

const VERIFY = gql`
  mutation Verify($phone: String!, $code: String!) {
    verify(phone: $phone, code: $code) {
      user {
        id
        phone
        isAdmin
      }
      accessToken
      refreshToken
    }
  }
`;

const RESEND = gql`
  mutation Resend($phone: String!) {
    resend(phone: $phone) {
      id
      phone
      isAdmin
    }
  }
`;

const Verify = () => {
  const router = useIonRouter();

  const { 
    phone, 
    setPhone, 
    isVerified, 
    setIsVerified,
  } = useContext(AppContext);

  const [code, setCode] = useState<string>('');

  const [isCodeInvalid, setIsCodeInvalid] = useState<boolean>(false);

  const { refreshTokenInterval } = useToken()

  const [verify] = useMutation(VERIFY, {
    onError: (err) => {
      console.log(err);
      if (err.message === 'Invalid verification code') {
        setIsCodeInvalid(true);
        setTimeout(() => {
          setIsCodeInvalid(false);
        }, 3000)
      }
    },
    onCompleted: async (data) => {
      console.log(data);
      if (data.verify.user.id) {
        setIsVerified(true);
        router.push('/home');

        await Preferences.set({
          key: PHONE_KEY,
          value: data.verify.user.phone,
        });

        await Preferences.set({
          key: ACCESS_TOKEN_KEY,
          value: data.verify.accessToken,
        });
        
        await Preferences.set({
          key: REFRESH_TOKEN_KEY,
          value: data.verify.refreshToken,
        })

        refreshTokenInterval();
      }
    }
  });

  const [showResent, setShowResent] = useState<boolean>(false);
  const [resend] = useMutation(RESEND, {
    onError: (err) => {
      console.log(err);
    },
    onCompleted: (data) => {
      console.log(data);
      if (data.resend.id) {
        setShowResent(true);
        setTimeout(() => {
          setShowResent(false);
        }, 3000);
      }
    }
  });

  const onInput = (e: Event) => {
    const val = (e.target as HTMLIonInputElement).value as string;
    setCode(val);
  }

  const onVerify = () => {
    const code1 = code.replace(/[^0-9]/g, '').trim();
    verify({ 
      variables: { 
        phone, 
        code: code1 
      }
    });
  }

  const onResend = () => {
    resend({ variables: { phone } })
  }

  const onBack = () => {
    setPhone('');
  }

  return (
    <IonContent fullscreen>
    <div style={{
      padding: 20,
    }}>
      A verification code has been texted to 
      <div style={{
        margin: 10,
      }}>
        +1 {phone.slice(0, 3)} {phone.slice(3, 6)} {phone.slice(6-10)}.
      </div>
      <div style={{
        marginTop: 5,
      }}>
        Enter this code to login.
      </div>
      <div style={{
        display: 'flex',
      }}>
      <IonInput
        type={'number'} 
        placeholder='123456' 
        onIonInput={onInput}
        value={code}
      />
      </div>
      <div>
        <IonButton disabled={isCodeInvalid} onClick={onVerify}>
          {
            isCodeInvalid
              ? 'Invalid code'
              : 'Login'
          }
        </IonButton>
      </div>
      <div>
        <IonButton disabled={showResent} onClick={onResend}>
          {
            showResent 
              ? 'Code resent'
              : 'Resend code'
          }
        </IonButton>
      </div>
      <div>
        <IonButton onClick={onBack}>
          Back
        </IonButton>
      </div>
    </div>
  </IonContent>
  )
}

export default Verify;
