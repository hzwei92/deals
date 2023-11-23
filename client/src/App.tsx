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
  IonToast,
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
import { Dispatch, SetStateAction, createContext, useEffect, useRef, useState } from 'react';
import useJanus from './hooks/useJanus';
import CreateChannel from './pages/CreateChannel';
import mapboxgl from 'mapbox-gl';
import { useAppSelector } from './store';
import { selectAppUser } from './slices/userSlice';
import { selectFocusChannel } from './slices/channelSlice';
import useGetMemberships from './hooks/useGetMemberships';
import useSubMembershipUpdated from './hooks/useSubMembershipUpdated';
import useJoinChannel from './hooks/useJoinChannel';
import useSubChannelUpdated from './hooks/useSubChannelUpdated';
import useSubPostUpdated from './hooks/useSubPostUpdated';
import { selectMembershipsByUserId } from './slices/membershipSlice';
import usePushNotifications from './hooks/usePushNotifications';

setupIonicReact();

export const AppContext = createContext({} as {
  // auth
  authModal: React.MutableRefObject<HTMLIonModalElement | null>;
  // janus
  streams: Record<number, any>;
  // map
  shouldUpdateMapData: boolean;
  setShouldUpdateMapData: Dispatch<SetStateAction<boolean>>;
  newChannelLngLat: mapboxgl.LngLat | null;
  setNewChannelLngLat: Dispatch<SetStateAction<mapboxgl.LngLat | null>>;
  // channel
  channelMode: 'talk' | 'text' | 'roam';
  setChannelMode: Dispatch<SetStateAction<'talk' | 'text' | 'roam'>>;
});

const App: React.FC = () => {
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);
  const memberships = useAppSelector(state => selectMembershipsByUserId(state, user?.id ?? -1));

  const [shouldUpdateMapData, setShouldUpdateMapData] = useState(false);
  const [newChannelLngLat, setNewChannelLngLat] = useState<mapboxgl.LngLat | null>(null);

  const [channelMode, setChannelMode] = useState<'talk' | 'text' | 'roam'>('talk');

  const { 
    streams,
  } = useJanus();
  
  const authModal = useRef<HTMLIonModalElement>(null);

  const getMemberships = useGetMemberships(setShouldUpdateMapData);

  const joinChannel = useJoinChannel();

  useEffect(() => {
    if (user?.id) {
      getMemberships();
    }
  }, [user?.id]);

  useEffect(() => {
    if (channel?.id) {
      joinChannel(channel.id);
    }
  }, [channel?.id]);

  useSubChannelUpdated(setShouldUpdateMapData, -90, 90, -180, 180);

  const subscribedChannelIds = memberships
    .filter(m => m.isOwner || m.isSaved)
    .sort((a, b) => a.lastOpenedAt > b.lastOpenedAt ? -1 : 1)
    .map(m => m.channelId);

  if (channel?.id) {
    subscribedChannelIds.push(channel.id)
  }

  useSubMembershipUpdated(subscribedChannelIds);
  useSubPostUpdated(subscribedChannelIds)

  usePushNotifications();

  return (
    <IonApp>
      <AppContext.Provider value={{
        authModal,
        streams,
        shouldUpdateMapData,
        setShouldUpdateMapData,
        newChannelLngLat,
        setNewChannelLngLat,
        channelMode,
        setChannelMode,
      }}>
        <IonReactRouter>
          <AppBar />
          <AuthModal />
          <AccountModal />
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/channel/:id" component={Channel} />
              <Route exact path="/create-channel" component={CreateChannel} />
              <Route exact path="/create-deal" component={CreateDeal} />
              <Route exact path="/deal/:id" component={Deal} />
              <Route exact path="/trade" component={Trade} />
              <Route path="/map" component={Map} />
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
