import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { isPlatform } from '@ionic/react';
import { DEV_SERVER_URI, PROD_SERVER_URI } from './constants';

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production'
    ? isPlatform('ios') || isPlatform('android')
      ? `${PROD_SERVER_URI}/graphql`
      : '/graphql'
    : `${DEV_SERVER_URI}/graphql`,
});

const client = new ApolloClient({
  link: httpLink,
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