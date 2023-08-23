import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, useIonRouter } from '@ionic/react';
import { useState } from 'react';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { usePhotoGallery } from '../hooks/usePhotoGallery';
import { Uint8ArrayFromBase64 } from '../utils';
import { Preferences } from '@capacitor/preferences';
import { ACCESS_TOKEN_KEY, DEV_SERVER_URI, PROD_SERVER_URI } from '../constants';
import { cameraOutline } from 'ionicons/icons';
import AppBar from '../components/AppBar';
import AccountModal from '../components/AccountModal';
import AuthModal from '../components/AuthModal';

const CreateDeal: React.FC = () => {
  const router = useIonRouter();
    
  const [name, setName] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  // const [discountPrice, setDiscountPrice] = useState<number>(0);

  const { photo, takePhoto } = usePhotoGallery();

  const handleUpload = async () => {
    if (!photo) return;

    const file = await Filesystem.readFile({
      path: photo.filepath,
      directory: Directory.Data,
    })

    const binaryData = Uint8ArrayFromBase64(file.data);
    const blob = new Blob([binaryData], { type: 'image/jpeg' });

    const body = new FormData();
    body.append('file', blob);
    body.append('name', name);
    body.append('detail', detail);
    body.append('quantity', quantity.toString());
    body.append('price', price.toString());
    // body.append('discountPrice', discountPrice.toString());

    const accessToken = await Preferences.get({
      key: ACCESS_TOKEN_KEY,
    });

    // if env is dev, use localhost:4000 else, use empty string
    const url = process.env.NODE_ENV === 'development' 
      ? DEV_SERVER_URI
      : PROD_SERVER_URI;

    fetch(url + '/deals/add-deal', {
      method: 'POST',
      body: body,
      headers: {
        accesstoken: accessToken.value || '',
      }
    }).then(res => {
      console.log(res);
      //setShouldGetDeals(true);
      router.push('/deal');
    }).catch(err => {
      console.error(err);
    });
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
        <IonHeader style={{
          margin: 20,
          alignItems: 'center',
        }}>
          <h1>CREATE A DEAL</h1>
        </IonHeader>
          <div style={{
            margin: 20,
            marginTop: 0,
            maxWidth: 420,
          }}>
          <IonItem style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <IonLabel>Photo: </IonLabel>
            <IonButtons>
              <IonButton onClick={() => takePhoto()}>
                <IonIcon icon={cameraOutline}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonItem>
          <IonItem style={{
            display: photo ? 'flex' : 'none',
          }}>
          {
            photo && (<img src={photo.webviewPath} style={{
              borderRadius: 5,
            }}/>)
          }
          </IonItem>
          <IonItem style={{
            display: 'flex',
          }}>
            <IonLabel>Name: </IonLabel>
            <IonInput type='text' value={name} onIonChange={
              (e: any) => setName(e.target.value)
            }/>
          </IonItem>
          <IonItem style={{
            display: 'flex',
          }}>
            <IonLabel>Detail: </IonLabel>
            <IonInput type='text' value={detail} onIonChange={
              (e: any) => setDetail(e.target.value)
            }/>
          </IonItem>
          <IonItem style={{
            display: 'flex',
          }}>
            <IonLabel>Quantity: </IonLabel>
            <IonInput type='number' value={quantity} onIonChange={
              (e: any) => setQuantity(e.target.value)
            }/>
          </IonItem>
          <IonItem style={{
            display: 'flex',
          }}>
            <IonLabel>Price: </IonLabel>   
            <IonInput type='number' placeholder='Price' value={price} onIonChange={
              (e: any) => setPrice(e.target.value)
            }/>
          </IonItem>
          <IonButtons style={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
          }}>
            <IonButton onClick={handleUpload} style={{
              border: '1px solid',
              borderRadius: 5,
              height: 50,
              fontWeight: 'bold',
              fontSize: 24,
            }}>
              SUBMIT
            </IonButton>
            <IonButton routerLink='/deal' style={{
              marginTop: 10,
              border: '1px solid',
              borderRadius: 5,
              height: 50,
              fontWeight: 'bold',
              fontSize: 24,
            }}>
              BACK
            </IonButton>
          </IonButtons>
          </div>
          
          </div>
        </IonContent>
    </IonPage>
  );
};

export default CreateDeal;
