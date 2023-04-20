import { useState } from 'react';
import { Deal, getDeal } from '../data/deals';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import { useParams } from 'react-router';
import './ViewDeal.css';

function ViewDeal() {
  const [deal, setDeal] = useState<Deal>();
  const params = useParams<{ id: string }>();

  useIonViewWillEnter(() => {
    const msg = getDeal(parseInt(params.id, 10));
    setDeal(msg);
  });

  return (
    <IonPage id="view-deal-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Deals" defaultHref="/home"></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {deal ? (
          <>
            <IonItem>
              <IonLabel className="ion-text-wrap">
                <h1 style={{
                  marginLeft: 5,
                  padding: 10,
                  fontWeight: 'bold',
                }}>{deal.name}</h1>
              </IonLabel>
            </IonItem>

            <div className="ion-padding">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </>
        ) : (
          <div>Deal not found</div>
        )}
      </IonContent>
    </IonPage>
  );
}

export default ViewDeal;
