import {
  IonButton, 
  IonCard, 
  IonLabel,
  } from '@ionic/react';
import { Deal } from '../data/deals';
import { Uint8ArrayFromBase64 } from '../utils';
import './DealListItem.css';
interface DealListItemProps {
  deal: Deal;
}

const DealListItem: React.FC<DealListItemProps> = ({ deal }) => {
  const byteArray = Uint8ArrayFromBase64(deal.image.data);
  const image = new Blob([byteArray], { type: 'image/jpeg' });
  const src = URL.createObjectURL(image);

  return (
    <IonCard routerLink={`/deal/${deal.id}`} style={{
      padding: 10,
      margin: 15,
    }}>
      <IonLabel className="ion-text-wrap">
        <h1 style={{
          fontWeight: 'bold',
        }}>
          {deal.name}
        </h1>
        <img src={src} style={{
          width: '100%',
        }}/>
        <h3>
          {deal.detail}
        </h3>
        <IonButton>
          ${deal.price}
        </IonButton>
      </IonLabel>
    </IonCard>
  );
};

export default DealListItem;
