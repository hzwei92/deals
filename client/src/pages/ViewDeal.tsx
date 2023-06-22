import { useContext, useState } from 'react';
import { Deal } from '../data/deals';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import { useParams } from 'react-router';
import './ViewDeal.css';
import { AppContext } from '../App';
import { Uint8ArrayFromBase64 } from '../utils';

function ViewDeal() {
  const { deals } = useContext(AppContext);

  const params = useParams<{ id: string }>();

  let src = '';
  let deal = undefined as Deal | undefined;
  deals.some(d => {
    if (d.id.toString() === params.id) {
      deal = d;
      const byteArray = Uint8ArrayFromBase64(deal.image.data);
      const image = new Blob([byteArray], { type: 'image/jpeg' });
      src = URL.createObjectURL(image);
      return true;
    }
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
                }}>
                  {deal.name}
                </h1>
              </IonLabel>
            </IonItem>
            <img src={src} style={{
              width: '100%',
            }}/>
            <div className="ion-padding">
              <p>
                { deal.detail }
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
