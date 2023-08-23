import {
  IonButton, 
  IonButtons, 
  IonCard,
  } from '@ionic/react';
import { useEffect, useState } from 'react';
import { Deal } from '../types/Deal';
import { Uint8ArrayFromBase64 } from '../utils';

interface DealListItemProps {
  deal: Deal;
}

const DealListItem: React.FC<DealListItemProps> = ({ deal }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    const byteArray = Uint8ArrayFromBase64(deal.image.data);
    const image = new Blob([byteArray], { type: 'image/jpeg' });
    const src = URL.createObjectURL(image);
    setSrc(src);

    return () => {
      URL.revokeObjectURL(src);
    }
  }, [])

  const url = '/deal/' + deal.id;

  return (
    <IonCard routerLink={url} style={{
      margin: 'auto',
      marginBottom: 10,
      padding: 10,
      maxWidth: 420,
      color: 'var(--ion-color-secondary-contrast)',
      backgroundColor: 'var(--ion-color-primary-contrast)',
    }}>
      <h1 style={{
        marginTop: 0,
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: 32,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        {deal.name}
      </h1>
      <img src={src} style={{
        width: '100%',
        borderRadius: 5,
      }}/>
      <h3 style={{
        margin: 5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        {deal.detail}
      </h3>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {deal.quantity} available @&nbsp;
        </div>
        <IonButtons>
          <IonButton routerLink={url} style={{
            backgroundColor: '',
            borderRadius: 5,
            border: '1px solid'
          }}>
            ${deal.price}
          </IonButton>
        </IonButtons>
      </div>
    </IonCard>
  );
};

export default DealListItem;