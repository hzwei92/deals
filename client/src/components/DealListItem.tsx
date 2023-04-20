import {
  IonButton, 
  IonCard, 
  IonItem,
  IonLabel,
  } from '@ionic/react';
import { Deal } from '../data/deals';
import './DealListItem.css';

import vegas from './vegas.jpeg';
import whatsonot from './whatsonot.png';
import burrito from './burrito.jpeg';
import trifecta from './trifecta.png';
import tuesday from './tuesday.png';

interface DealListItemProps {
  deal: Deal;
}

const DealListItem: React.FC<DealListItemProps> = ({ deal }) => {
  const imageSrc = (() => {
    switch (deal.id) {
      case 0:
        return vegas;
      case 1:
        return whatsonot;
      case 2: 
        return burrito;
      case 3:
        return trifecta;
      case 4: 
        return tuesday;
      default:
        return vegas
    }
  })();
  return (
    <IonCard routerLink={`/message/${deal.id}`} style={{
      padding: 10,
      margin: 15,
    }}>
      <IonLabel className="ion-text-wrap">
        <h1 style={{
          fontWeight: 'bold',
        }}>
          {deal.name}
        </h1>
        <img src={imageSrc} style={{
          width: '100%',
        }}/>
        <h3>
          {deal.detail}
        </h3>
        <IonButton>
          BUY @ ${deal.price}
        </IonButton>
        <IonButton>
          BUY 2 @ ${deal.discountPrice}
        </IonButton>
      </IonLabel>
    </IonCard>
  );
};

export default DealListItem;
