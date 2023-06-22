import DealListItem from '../components/DealListItem';
import { useContext, useEffect, useState } from 'react';
import { Deal } from '../data/deals';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Home.css';
import { add, personOutline } from 'ionicons/icons';
import { gql, useMutation } from '@apollo/client';
import { AppContext } from '../App';

const GET_DEALS = gql`
  mutation GetDeals($mobile: String!) {
    getDeals(mobile: $mobile) {
      id
      name
      detail
      price
      discountPrice
      image {
        data
      }
    }
  }
`;


const Home: React.FC = () => {
  const { 
    mobile,
    deals,
    setDeals,
    shouldGetDeals,
    setShouldGetDeals,
  } = useContext(AppContext);

  const [getDeals] = useMutation(GET_DEALS, {
    onError: (err) => {
      console.log(err);
    },
    onCompleted: (data) => {
      console.log(data);

      setDeals(data.getDeals);
    }
  })

  const refresh = (e: CustomEvent) => {
    setTimeout(() => {
      e.detail.complete();
    }, 3000);
  };

  useEffect(() => {
    if (!shouldGetDeals) return;
    getDeals({
      variables: {
        mobile,
      },
    }); 
    setShouldGetDeals(false);
  }, [shouldGetDeals]);

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
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink='/add-deal'>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Home;
