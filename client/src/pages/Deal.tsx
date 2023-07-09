import { useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
} from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { selectDeal } from '../slices/dealSlice';
import { useAppSelector } from '../store';
import { Uint8ArrayFromBase64 } from '../utils';
import { selectAppUser } from '../slices/userSlice';
import { Deal } from '../types/Deal';
import Checkout from '../components/Checkout';

interface DealProps extends RouteComponentProps<{
  id: string;
}> {}

const DealPage: React.FC<DealProps> = ({ match }) => {
  const user = useAppSelector(selectAppUser);
  const deal = useAppSelector(state => selectDeal(state, parseInt(match.params.id))) as Deal | null;

  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    if (!deal) return;
    const byteArray = Uint8ArrayFromBase64(deal.image.data);
    const image = new Blob([byteArray], { type: 'image/jpeg' });
    const src = URL.createObjectURL(image);
    setImgSrc(src);
    return () => {
      URL.revokeObjectURL(src);
    }
  }, [deal?.id]);

  if (!deal) return null;
  
  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ 
          margin: 'auto',
          maxWidth: 420,
          padding: 20,
          paddingTop: 0,
        }}>
          <h1 style={{
            fontWeight: 'bold',
            fontSize: 32,
          }}>
            {deal.name}
          </h1>
          <IonButtons style={{
            marginTop: 15,
          }}>
            <IonButton routerLink='/deal' style={{
              border: '1px solid',
              borderRadius: 5,
            }}>
              BACK
            </IonButton>
          </IonButtons>
          <img src={imgSrc} style={{
            marginTop: 15,
            width: '100%',
            borderRadius: 5,
          }} />
          <h3 style={{
          }}>
            {deal.detail}
          </h3>
          {
            (deal.quantity > 0 && deal.vendorId !== user?.id) && (
              <Checkout deal={deal} />
            )
          }
        </div>
    </IonContent>
    </IonPage>
  );
}

export default DealPage;
