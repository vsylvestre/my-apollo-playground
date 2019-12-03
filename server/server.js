const { ApolloServer, PubSub, gql } = require('apollo-server');
const { ObjectId } = require('mongodb');

function startApollo(db) {
  const pubsub = new PubSub();

  const NODE_ADDED = 'NODE_ADDED';

  const typeDefs = gql`
    type Subscription {
      nodeAdded: Node
    }

    type Query {
      nodes: [Node]
    }

    type Mutation {
      addNode(text: String!): Boolean
      deleteNode(id: String!): Boolean
    }

    type Node {
      _id: String
      text: String
    }
  `;

  const resolvers = {
    Subscription: {
      nodeAdded: {
        subscribe: () => pubsub.asyncIterator([NODE_ADDED])
      }
    },
    Query: {
      nodes: async () => await db.collection("nodes").find({}).toArray()
    },
    Mutation: {
      addNode: async (_, args) => {
        const { result, ops } = await db.collection("nodes").insertOne({ text: args.text });

        if (!result.ok) {
          return false;
        }

        await pubsub.publish(NODE_ADDED, { nodeAdded: ops[0] })
        return true;
      },
      deleteNode: async (_, args) => {
        const { result } = await db.collection("nodes").deleteOne({ _id: ObjectId(args.id) });
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