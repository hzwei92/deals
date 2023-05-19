import DealListItem from '../components/DealListItem';
import { useState } from 'react';
import { Deal, getDeals } from '../data/deals';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';
import './Home.css';
import { personOutline } from 'ionicons/icons';

const Home: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);

  useIonViewWillEnter(() => {
    const msgs = getDeals();
    setDeals(msgs);
  });

  const refresh = (e: CustomEvent) => {
    setTimeout(() => {
      e.detail.complete();
    }, 3000);
  };

  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Deals</IonTitle>
            <IonButton routerLink='/profile' slot='end'>
              <IonIcon icon={personOutline}></IonIcon>
            </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{
          margin: 'auto',
          maxWidth: 420,
        }}>
          <IonRefresher slot="fixed" onIonRefresh={refresh}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>
          <IonList>
            {deals.map(d => <DealListItem key={d.id} deal={d} />)}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
