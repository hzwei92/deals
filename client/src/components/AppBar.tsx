import { IonAvatar, IonButton, IonButtons, IonHeader, IonTitle, IonToolbar, isPlatform } from "@ionic/react"
import md5 from "md5";
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import useErrorSub from "../hooks/useErrorSub";
import useDestroyedSub from "../hooks/useDestroyedSub";
import useDisplaySub from "../hooks/useDisplaySub";
import useFeedListSub from "../hooks/useFeedListSub";
import useKickSub from "../hooks/useKickSub";
import useLeavingSub from "../hooks/useLeavingSub";
import useTalkingSub from "../hooks/useTalkingSub";
import useUnpublishedSub from "../hooks/useUnpublishedSub";
import useFeedJoinedSub from "../hooks/useFeedJoinedSub";

const AppBar: React.FC = () => {
  useErrorSub();
  useDestroyedSub();
  useDisplaySub();
  useFeedJoinedSub();
  useFeedListSub();
  useKickSub();
  useLeavingSub();
  useTalkingSub();
  useUnpublishedSub()
  
  const user = useAppSelector(selectAppUser);
  return (
    <IonHeader>
      <IonToolbar style={{
        position: 'fixed',
        paddingTop: isPlatform('ios') ? 10 : 0,
      }}>
        <IonTitle size="large">JAMN</IonTitle>
        <IonButtons slot='end'>
          <IonButton  id={'account-modal-button'} >
            <IonAvatar style={{
              display: user?.phone ? 'block' : 'none',
              margin: 10,
              width: 30,
              height: 30,
              cursor: 'pointer',
            }}>
              <img 
                src={`https://www.gravatar.com/avatar/${md5(user?.phone || '')}?d=retro`}
              />
            </IonAvatar>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

  )
}

export default AppBar;