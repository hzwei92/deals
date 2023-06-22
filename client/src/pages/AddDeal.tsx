import { useContext, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { camera, homeOutline } from 'ionicons/icons';
import { usePhotoGallery } from '../hooks/usePhotoGallery';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Uint8ArrayFromBase64 } from '../utils';
import { AppContext } from '../App';

const AddDeal: React.FC = () => {
  const { setShouldGetDeals } = useContext(AppContext);
  const router = useIonRouter();
  
  const [name, setName] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);

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
    body.append('price', price.toString());
    body.append('discountPrice', discountPrice.toString());

    fetch('http://localhost:4000/deals/add-deal', {
      method: 'POST',
      body: body,
    }).then(res => {
      console.log(res);
      setShouldGetDeals(true);
      router.push('/home');
    }).catch(err => {
      console.error(err);
    });
  }

  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonButton routerLink='/home' slot='start'>
            <IonIcon icon={homeOutline}></IonIcon>
          </IonButton>
          <IonTitle>Add Deal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {
          photo && (<IonImg src={photo.webviewPath} />)
        }
        <IonButton onClick={() => takePhoto()}>
          <IonIcon icon={camera}></IonIcon>
        </IonButton>
        <IonItem>
          <IonLabel>Name: </IonLabel>
          <IonInput type='text' value={name} onIonChange={
            (e: any) => setName(e.target.value)
          }/>
        </IonItem>
        <IonItem>
          <IonLabel>Detail: </IonLabel>
          <IonInput type='text' value={detail} onIonChange={
            (e: any) => setDetail(e.target.value)
          }/>
        </IonItem>
        <IonItem>
          <IonLabel>Price: </IonLabel>   
          <IonInput type='number' placeholder='Price' value={price} onIonChange={
            (e: any) => setPrice(e.target.value)
          }/>
        </IonItem>
        <IonItem>
          <IonLabel>Discount Price: </IonLabel>
          <IonInput type='number' placeholder='Discount Price' value={discountPrice} onIonChange={
            (e: any) => setDiscountPrice(e.target.value)
          }/>
        </IonItem>
        <IonButton onClick={handleUpload}>Submit</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AddDeal;
