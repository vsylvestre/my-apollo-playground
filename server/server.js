const { ApolloServer, gql } = require('apollo-server');

function startApollo(db) {
  const typeDefs = gql`
    type Query {
      nodes: [Node]
    }

    type Mutation {
      addNode(text: String!): Boolean
    }

    type Node {
      _id: String
      text: String
    }
  `;

  const resolvers = {
    Query: {
      nodes: async () => {
        return await db.collection("nodes").find({}).toArray();
      }
    },
    Mutation: {
      addNode: async (_, { text }) => {
        const { result } = await db.collection("nodes").insert({ text });
        return result.ok;
      }
    }
  };

  return new ApolloServer({
    typeDefs,
    resolvers
  });
}

module.exports = { startApollo };