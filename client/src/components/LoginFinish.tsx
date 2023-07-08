import { gql, useMutation } from "@apollo/client";
import { Preferences } from "@capacitor/preferences";
import { IonButton, IonButtons, IonContent, IonInput } from "@ionic/react"
import { useState } from "react";
import { ACCESS_TOKEN_KEY, PHONE_KEY, REFRESH_TOKEN_KEY } from "../constants";
import useToken from "../hooks/useToken";
import { addUsers, setAppUserId } from "../slices/userSlice";
import { useAppDispatch } from "../store";
import { User } from "../types/User";

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

interface LoginFinishProps {
  pendingUser: User;
  setPendingUser: (user: User | null) => void;
};

const LoginFinish: React.FC<LoginFinishProps> = ({ pendingUser, setPendingUser }) => {
  const dispatch = useAppDispatch();

  const [code, setCode] = useState<string>('');
  const [isCodeInvalid, setIsCodeInvalid] = useState<boolean>(false);
  const { refreshTokenInterval } = useToken()

  const [verify] = useMutation(VERIFY, {
    onError: (err) => {
      console.log(err);
      if (err.message === 'Invalid verification code') {
        setIsCodeInvalid(true);
      }
    },
    onCompleted: async (data) => {
      console.log(data);
      if (data.verify.user.id) {
        dispatch(addUsers([data.verify.user]));
        dispatch(setAppUserId(data.verify.user.id));

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

  const handleInput = (e: Event) => {
    const val = (e.target as HTMLIonInputElement).value as string;
    setCode(val);
    setIsCodeInvalid(false);
  }

  const handleVerify = () => {
    const code1 = code.replace(/[^0-9]/g, '').trim();
    verify({ 
      variables: { 
        phone: pendingUser.phone, 
        code: code1 
      }
    });
  }

  const handleResend = () => {
    resend({ variables: { phone: pendingUser.phone } })
  }

  const handleBack = () => {
    setPendingUser(null);
  }

  return (
    <IonContent fullscreen>
    <div>
      <div style={{
        margin: 30,
      }}>
        A <b>verification code</b> has been texted to 
      </div>
      <div style={{
        margin: 30,
        fontWeight: 'bold',
        fontSize: 24,
      }}>
        +1 {pendingUser.phone.slice(0, 3)} {pendingUser.phone.slice(3, 6)} {pendingUser.phone.slice(6-10)}.
      </div>
      <div style={{
        margin: 30,
      }}>
        Enter this code to login.
      </div>
      <div style={{
        margin: 30,
        paddingLeft: 10,
        paddingRight: 10,
        border: '1px solid',
        borderRadius: 5,
        marginTop: 30,
        width: 160,
      }}>
        <IonInput
          type={'number'} 
          placeholder='123456' 
          onIonInput={handleInput}
          value={code}
          style={{
            fontSize: 24,
          }}
        />
      </div>
      <IonButtons style={{
        margin: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
      }}>
        <IonButton disabled={code.length !== 6} onClick={handleVerify} style={{
          border: '1px solid',
          borderRadius: 5,
          fontSize: 24,
          fontWeight: 'bold',
          height: 50,
          marginBottom: 10,
        }}>
          {
            isCodeInvalid
              ? 'INVALID CODE...'
              : 'LOGIN'
          }
        </IonButton>
        <IonButton disabled={showResent} onClick={handleResend} style={{
          border: '1px solid',
          borderRadius: 5,
          fontSize: 24,
          fontWeight: 'bold',
          height: 50,
          marginBottom: 10,
        }}>
          {
            showResent 
              ? 'CODE SENT...'
              : 'RESEND CODE'
          }
        </IonButton>
        <IonButton onClick={handleBack} style={{
          border: '1px solid',
          borderRadius: 5,
          fontSize: 24,
          fontWeight: 'bold',
          height: 50,
        }}>
          BACK
        </IonButton>
      </IonButtons>
      </div>
  </IonContent>
  )
}

export default LoginFinish;
