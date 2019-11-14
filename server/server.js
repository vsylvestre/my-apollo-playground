const { ApolloServer, gql } = require('apollo-server');

function startApollo(db) {
  const typeDefs = gql`
    type Query {
      "A simple type for getting started!"
      items: [Item]
      item(id: String): Item
    }

    type Item {
      _id: String
      content: String
      isDone: Boolean
    }
  `;

  const resolvers = {
    Query: {
      items: async () => {
        return await db.collection("todos").find({}).toArray();
      },
      item: async (_, { id }) => {
        return await db.collection("todos").findOne({ _id: id });
      }
    }
  };

  return new ApolloServer({
    typeDefs,
    resolvers
  });
}

module.exports = { startApollo };