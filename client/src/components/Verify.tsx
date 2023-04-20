import { gql, useMutation } from "@apollo/client";
import { IonButton, IonButtons, IonContent, IonInput, useIonRouter } from "@ionic/react"
import { useContext, useState } from "react";
import { AppContext } from "../App";

const VERIFY = gql`
  mutation Verify($mobile: String!, $code: String!) {
    verify(mobile: $mobile, code: $code) {
      id
      mobile
      isAdmin
    }
  }
`;

const RESEND = gql`
  mutation Resend($mobile: String!) {
    resend(mobile: $mobile) {
      id
      mobile
      isAdmin
    }
  }
`;

const Verify = () => {
  const router = useIonRouter();

  const { 
    mobile, 
    setMobile, 
    isVerified, 
    setIsVerified,
  } = useContext(AppContext);

  const [code, setCode] = useState<string>('');

  const [isCodeInvalid, setIsCodeInvalid] = useState<boolean>(false);

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
    onCompleted: (data) => {
      console.log(data);
      if (data.verify.id) {
        setIsVerified(true);
        router.push('/home', 'forward');
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
        mobile, 
        code: code1 
      }
    });
  }

  const onResend = () => {
    resend({ variables: { mobile } })
  }

  const onBack = () => {
    setMobile('');
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
        +1 {mobile.slice(0, 3)} {mobile.slice(3, 6)} {mobile.slice(6-10)}.
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
