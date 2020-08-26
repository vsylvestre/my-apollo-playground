import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client/core";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities/";

export default function useApolloClient() {
  const cache = new InMemoryCache();

  const httpLink = new HttpLink({
    uri: 'http://localhost:4000/'
  });

  const websocketLink = new WebSocketLink({
    uri: 'ws://localhost:4000/graphql',
    options: {
      reconnect: true
    }
  });

  const link = split(
    // Split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    websocketLink,
    httpLink,
  );

  const client = new ApolloClient({
    cache,
    link
  });

  return client;
}
