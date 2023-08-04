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

import Meme from './pages/Meme';
import Map from './pages/Map';
import Deals from './pages/Deals';
import Deal from './pages/Deal';
import AppBar from './components/AppBar';
import AuthModal from './components/AuthModal';
import AccountModal from './components/AccountModal';
import CreateDeal from './pages/CreateDeal';
import Channel from './pages/Channel';
import { createContext } from 'react';
import { useAppSelector } from './store';
import { selectActiveChannel } from './slices/channelSlice';
import { selectAppUser } from './slices/userSlice';
import useJanus from './hooks/useJanus';

setupIonicReact();

export const AppContext = createContext({} as {
  refresh: boolean;
  joinRoom: (room: number, id: number, username: string) => void;
  unpublishOwnFeed: () => void;
  unsubscribeFrom: (id: string) => void;
  resetHandle: () => void;
});

const App: React.FC = () => {
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectActiveChannel);
  const { 
    refresh,
    joinRoom,
    unpublishOwnFeed,
    unsubscribeFrom,
    resetHandle,
  } = useJanus();

  return (
    <IonApp>
      <AppContext.Provider value={{
        refresh,
        joinRoom,
        unpublishOwnFeed,
        unsubscribeFrom,
        resetHandle,
      }}>
        <IonReactRouter>
          <AppBar />
          <IonTabs>
            <IonRouterOutlet style={{
              marginTop: isPlatform('ios') ? 56 : 60,
            }}>
              <Route exact path="/meme"  component={Meme} />
              <Route exact path="/map" component={Map} />
              <Route exact path="/map/channel/:id" component={Channel} />
              <Route exact path="/deal" component={Deals} />
              <Route exact path="/deal/create" component={CreateDeal} />
              <Route exact path="/deal/deal/:id" component={Deal} />
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
              <IonTabButton tab="deal" href="/deal">
                <IonIcon aria-hidden="true" icon={square} />
                <IonLabel>DEAL</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
        <AuthModal />
        <AccountModal />
      </AppContext.Provider>
    </IonApp>
  );
};

export default App;
