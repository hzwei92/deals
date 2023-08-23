import { useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
} from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { selectDeal } from '../slices/dealSlice';
import { useAppSelector } from '../store';
import { Uint8ArrayFromBase64 } from '../utils';
import { selectAppUser } from '../slices/userSlice';
import { Deal } from '../types/Deal';
import Checkout from '../components/Checkout';
import { arrowBackOutline } from 'ionicons/icons';
import AppBar from '../components/AppBar';
import AuthModal from '../components/AuthModal';
import AccountModal from '../components/AccountModal';

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
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          marginLeft: 5,
          marginTop: 5,
        }}>
          <IonButtons style={{
            display: 'inline-flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <IonButton routerLink='/deal' style={{
            }}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <div style={{
            display: 'inline-flex',
            fontSize: 32,
            fontWeight: 'bold',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            { deal.name }
          </div>
        </div>
        <div style={{ 
          margin: 'auto',
          maxWidth: 420,
          padding: 20,
          paddingTop: 0,
        }}>
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
            (user?.id && deal.quantity > 0 && deal.vendorId !== user?.id) && (
              <Checkout deal={deal} />
            )
          }
        </div>
      </IonContent>
    </IonPage>
  );
}

export default DealPage;
