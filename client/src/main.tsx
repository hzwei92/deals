import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { isPlatform } from '@ionic/react';
import { DEV_SERVER_URI, PROD_SERVER_URI } from './constants';
import { setContext } from '@apollo/client/link/context';
import { Preferences } from '@capacitor/preferences';
import { ACCESS_TOKEN_KEY } from './constants';

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production'
    ? isPlatform('ios') || isPlatform('android')
      ? `${PROD_SERVER_URI}/graphql`
      : '/graphql'
    : `${DEV_SERVER_URI}/graphql`,
});


const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const accessToken = await Preferences.get({
    key: ACCESS_TOKEN_KEY,
  })
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      accesstoken: accessToken.value,
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);