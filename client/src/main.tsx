import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, split } from '@apollo/client';
import { isPlatform } from '@ionic/react';
import { DEV_SERVER_URI, PROD_SERVER_URI, ACCESS_TOKEN_KEY } from './constants';
import { setContext } from '@apollo/client/link/context';
import { Preferences } from '@capacitor/preferences';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

(window as any).EXCALIDRAW_ASSET_PATH = process.env.NODE_ENV === 'production'
  ? '/excalidraw-assets'
  : '/excalidraw-assets-dev';

const wsLink = new GraphQLWsLink(createClient({
  url: process.env.NODE_ENV === 'production'
    ? (isPlatform('android') || isPlatform('ios')) && !isPlatform('mobileweb')
      ? `ws://${PROD_SERVER_URI}/graphql`
      : window.location.origin.replace(/^http/, 'ws') + '/graphql'
    : `ws://${DEV_SERVER_URI}/graphql`,
}));

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production'
    ? (isPlatform('ios') || isPlatform('android')) && !isPlatform('mobileweb')
      ? `https://${PROD_SERVER_URI}/graphql`
      :  window.location.origin + '/graphql'
    : `http://${DEV_SERVER_URI}/graphql`,
  credentials: process.env.NODE_ENV === 'production'
    ? (isPlatform('ios') || isPlatform('android')) && !isPlatform('mobileweb')
      ? 'include'
      : 'same-origin'
    : 'include'
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const accessToken = await Preferences.get({
    key: ACCESS_TOKEN_KEY,
  });
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      accesstoken: accessToken.value,
    }
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);


export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

import { store } from './store';
import { Provider } from 'react-redux';
import { getMainDefinition } from '@apollo/client/utilities';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
      <ApolloProvider client={client}>
        <Provider store={store}>
          <App />
        </Provider>
      </ApolloProvider>
  </React.StrictMode>
);