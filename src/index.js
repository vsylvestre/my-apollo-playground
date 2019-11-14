import React from "react";
import ReactDOM from "react-dom";
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from "react-apollo";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import List from "./List";

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: 'http://localhost:4000/'
});

const client = new ApolloClient({
  cache,
  link
});

function App() {
  return (
    <ApolloProvider client={client}>
      <List />
    </ApolloProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);