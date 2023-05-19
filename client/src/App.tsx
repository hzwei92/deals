import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { createContext, useState } from 'react';
import Profile from './pages/Profile';
import AppInitializer from './AppInitializer';
import Home from './pages/Home';
import ViewDeal from './pages/ViewDeal';
import Auth from './pages/Auth';

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

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

export const AppContext = createContext({
  mobile: '',
  setMobile: (mobile: string) => {},
  isVerified: false,
  setIsVerified: (isVerified: boolean) => {},
  tokenRefreshInterval: null as ReturnType<typeof setInterval> | null,
  setTokenRefreshInterval: (tokenRefreshInterval: ReturnType<typeof setInterval> | null) => {},
});

const App: React.FC = () => {
  const [mobile, setMobile] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  return (
    <AppContext.Provider value={{ 
      mobile, 
      setMobile,
      isVerified,
      setIsVerified,
      tokenRefreshInterval,
      setTokenRefreshInterval,
    }}>
      <IonApp>
        <IonReactRouter>
          <AppInitializer />
          <IonRouterOutlet>
            <Route path="/" exact={true}>
              <Redirect to="/home" />
            </Route>
            <Route path="/login" exact={true}>
              <Auth />
            </Route>
            <Route path="/home" exact={true}>
              <Home />
            </Route>
            <Route path="/profile" exact={true}>
              <Profile />
            </Route>
            <Route path="/message/:id">
              <ViewDeal />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </AppContext.Provider>
  )
};

export default App;
