import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  isPlatform,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import 'mapbox-gl/dist/mapbox-gl.css';

/* Theme variables */
import './theme/variables.css';

import './theme/main.css';

import Meme from './pages/Meme';
import Map from './pages/Map';
import Trade from './pages/Trade';
import Deal from './pages/Deal';
import AppBar from './components/AppBar';
import AuthModal from './components/AuthModal';
import AccountModal from './components/AccountModal';
import CreateDeal from './pages/CreateDeal';
import Channel from './pages/Channel';
import { Dispatch, SetStateAction, createContext, useRef, useState } from 'react';
import useJanus from './hooks/useJanus';
import CreateChannel from './pages/CreateChannel';
import mapboxgl from 'mapbox-gl';

setupIonicReact();

export const AppContext = createContext({} as {
  // auth
  authModal: React.MutableRefObject<HTMLIonModalElement | null>;
  // janus 
  refresh: boolean;
  joinRoom: (room: number, id: number, username: string) => void;
  unpublishOwnFeed: () => void;
  unsubscribeFrom: (id: string) => void;
  disconnect: () => void;
  // map
  shouldUpdateMapData: boolean;
  setShouldUpdateMapData: Dispatch<SetStateAction<boolean>>;
  newChannelLngLat: mapboxgl.LngLat | null;
  setNewChannelLngLat: Dispatch<SetStateAction<mapboxgl.LngLat | null>>;
  channelId: number | null;
  setChannelId: Dispatch<SetStateAction<number | null>>;
});

const App: React.FC = () => {
  const [shouldUpdateMapData, setShouldUpdateMapData] = useState(false);
  const [newChannelLngLat, setNewChannelLngLat] = useState<mapboxgl.LngLat | null>(null);
  const [channelId, setChannelId] = useState<number | null>(null);

  const { 
    refresh,
    joinRoom,
    unpublishOwnFeed,
    unsubscribeFrom,
    disconnect,
  } = useJanus(shouldUpdateMapData, setShouldUpdateMapData);

  
  const authModal = useRef<HTMLIonModalElement>(null);

  return (
    <IonApp>
      <AppContext.Provider value={{
        authModal,
        refresh,
        joinRoom,
        unpublishOwnFeed,
        unsubscribeFrom,
        disconnect,
        shouldUpdateMapData,
        setShouldUpdateMapData,
        newChannelLngLat,
        setNewChannelLngLat,
        channelId,
        setChannelId,
      }}>
        <IonReactRouter>
          <AppBar />
          <AuthModal />
          <AccountModal />
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/channel/:id/:mode" component={Channel} />
              <Route exact path="/create-channel" component={CreateChannel} />
              <Route exact path="/create-deal" component={CreateDeal} />
              <Route exact path="/deal/:id" component={Deal} />
              <Route exact path="/trade" component={Trade} />
              <Route exact path="/map" component={Map} />
              <Route exact path="/meme"  component={Meme} />
              <Route exact path="/">
                <Redirect to="/map" />
              </Route>
            </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="meme" href="/meme">
                  <IonIcon aria-hidden="true" icon={triangle} />
                  <IonLabel>MEME</IonLabel>
                </IonTabButton>
                <IonTabButton tab="map" href="/map">
                  <IonIcon aria-hidden="true" icon={ellipse} />
                  <IonLabel>MAP</IonLabel>
                </IonTabButton>
                <IonTabButton tab="trade" href="/trade">
                  <IonIcon aria-hidden="true" icon={square} />
                  <IonLabel>TRADE</IonLabel>
                </IonTabButton>
              </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </AppContext.Provider>
    </IonApp>
  );
};

export default App;
