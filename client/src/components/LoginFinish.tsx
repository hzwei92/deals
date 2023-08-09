import { gql, useMutation } from "@apollo/client";
import { Preferences } from "@capacitor/preferences";
import { IonButton, IonButtons, IonContent, IonInput } from "@ionic/react"
import { useContext, useState } from "react";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";
import useToken from "../hooks/useToken";
import { addUsers, setAppUserId } from "../slices/userSlice";
import { useAppDispatch } from "../store";
import { User } from "../types/User";
import { AppContext } from "../App";
import { USER_FIELDS } from "../fragments/user";

const VERIFY = gql`
  mutation Verify($id: Int!, $code: String!) {
    verify(id: $id, code: $code) {
      user {
        ...UserFields
      }
      accessToken
      refreshToken
    }
  }
  ${USER_FIELDS}
`;

const RESEND = gql`
  mutation Resend($phone: String, $email: String) {
    resend(phone: $phone, email: $email) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

interface LoginFinishProps {
  pendingUser: User;
  setPendingUser: (user: User | null) => void;
};

const LoginFinish: React.FC<LoginFinishProps> = ({ pendingUser, setPendingUser }) => {
  const dispatch = useAppDispatch();

  const { authModal } = useContext(AppContext);

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
        setPendingUser(null);
        
        authModal.current?.dismiss();
        
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
        id: pendingUser.id, 
        code: code1 
      }
    });
  }

  const handleResend = () => {
    resend({ variables: { phone: pendingUser.phone, email: pendingUser.email } })
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
        A <b>verification code</b> has been { pendingUser.email ? 'emailed' : 'texted' } to 
      </div>
      <div style={{
        margin: 30,
        fontWeight: 'bold',
        fontSize: 24,
      }}>
        {
          pendingUser.email 
            ? pendingUser.email
            : null
        }
        {
          pendingUser.phone
            ? <div>
              +1 {pendingUser.phone.slice(0, 3)} {pendingUser.phone.slice(3, 6)} {pendingUser.phone.slice(6-10)}
              </div>
            : null
        }
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
