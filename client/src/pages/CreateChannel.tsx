import { IonButton, IonButtons, IonCard, IonInput, IonPage, isPlatform, useIonRouter } from "@ionic/react"
import { useState } from "react";
import useCreateChannel from "../hooks/useCreateChannel";


const CreateChannel: React.FC = () => {
  const router = useIonRouter();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [hasModifiedUrl, setHasModifiedUrl] = useState(false);
  const [description, setDescription] = useState(''); 
  const [error, setError] = useState('');

  console.log('yolo')
  
  const createChannel = useCreateChannel(
    (err: any) => {
      if (err.message === 'URL already in use')
        setError('URL already in use');
      else
        setError('Error creating channel');
    },
    () => {
      setName('');
      setUrl('');
      setDescription('');
    }
  );

  const cleanURL = (url: string) => {
    return url.toLowerCase().replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '').slice(0,40);
  }

  const handleNameChange = (e: any) => {
    setName(e.target.value);
    setError('')
  }

  const handleNameBlur = () => {
    if (!hasModifiedUrl) {
      setUrl(cleanURL(name));
    }

  }

  const handleUrlChange = (e: any) => {
    if (e.target.value !== url) {
      setHasModifiedUrl(true);
    }
    setUrl(cleanURL(e.target.value));
    setError('')
  }

  const handleUrlBlur = () => { 
    if (!url) {
      setUrl(cleanURL(name));
      setHasModifiedUrl(false);
    }
  }

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
    setError('')
  }

  const handleSubmit = () => {
    if (!name || !url) return;
    createChannel(name, url, description);
  }

  const handleBack = () => {
    console.log('hihi', router.routeInfo.pathname)
    router.push('/map', 'none');
  }
  return (
    <IonPage>
      <div style={{
        marginTop: isPlatform('ios') && !isPlatform('mobileweb') ? 105 : 50,
        height: 'calc(100% - 50px)',
        backgroundColor: 'var(--ion-color-light)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
      }}>
        <IonButtons style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <IonButton onClick={handleBack} style={{
            margin: 20,
            border: '1px solid',
            borderRadius: 5,
          }}>
            BACK
          </IonButton>
          <IonButton onClick={handleSubmit} disabled={!name || !url} style={{
            margin: 20,
            border: '1px solid',
            borderRadius: 5,
            fontWeight: 'bold',
            backgroundColor: 'var(--ion-color-primary)',
            color: 'var(--ion-color-light)'
          }}>
            CREATE
          </IonButton>
        </IonButtons>
        <IonCard style={{
          position: 'relative',
          marginTop: 0,
        }}>
          <IonInput autofocus={true} clearInput={true} value={name} onIonInput={handleNameChange} onIonBlur={handleNameBlur} style={{
            margin: 10,
            fontSize: 32,
            fontWeight: 'bold',
            width: 'calc(100% - 20px)',
          }} placeholder="NAME" />
          <IonInput clearInput={true} value={url} onIonChange={(e:any) => console.log(e.target.value)} onIonInput={handleUrlChange} onIonBlur={handleUrlBlur} style={{
            margin: 10,
            fontSize: 20,
            width: 'calc(100% - 20px)',
          }} placeholder="URL" />
          <IonInput clearInput={true} value={description} onIonInput={handleDescriptionChange} style={{
            margin: 10,
            fontSize: 20,
            width: 'calc(100% - 20px)',
          }} placeholder="DESCRIPTION" />
        </IonCard>

        <div style={{
          margin: 15,
          color: 'red',
        }}>
          { error }
        </div>
      </div>
    </IonPage>
  )
}

export default CreateChannel