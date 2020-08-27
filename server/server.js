const { ApolloServer, PubSub, gql } = require('apollo-server');
const { ObjectId } = require('mongodb');

function startApollo(db) {
    const pubsub = new PubSub();

    const DIAGRAM_UPDATED = 'DIAGRAM_UPDATED';

    const typeDefs = gql`
        type Subscription {
            diagramUpdated: DiagramUpdate
        }

        type Query {
            nodes: [Node]
        }

        type Mutation {
            updateDiagram(json: String!): Boolean
            addNode(text: String!, location: String!, stroke: String!): Boolean
        }

        type DiagramUpdate {
            addedNodes: [Node]
            updatedNodes: [Node]
            deletedNodes: [String]
        }

        type Node {
            _id: String
            text: String
            location: String
            stroke: String
            angle: Int
        }
    `;

    const resolvers = {
        Subscription: {
            diagramUpdated: {
                subscribe: () => pubsub.asyncIterator([DIAGRAM_UPDATED])
            }
        },
        Query: {
            nodes: async () => await db.collection("nodes").find({}).toArray()
        },
        Mutation: {
            updateDiagram: async (_, args) => {
                const { modifiedNodeData, removedNodeKeys } = JSON.parse(args.json);
                let updatedNodes = null, deletedNodes = null;
                if (modifiedNodeData) {
                    const strokeArray = ["red", "grey", "blue", "green", "yellow", "black", "purple"];
                    const newNodes = modifiedNodeData.map(node => ({ ...node, stroke: strokeArray[Math.floor(Math.random() * strokeArray.length)] }));
                    const updatePromises = newNodes.map(node => {
                        const { _id, ...nodeWithoutId } = node;
                        db.collection("nodes").replaceOne({ _id: ObjectId(_id) }, nodeWithoutId);
                    });
                    await Promise.all(updatePromises);
                    updatedNodes = newNodes;
                }
                if (removedNodeKeys) {
                    const removePromises = removedNodeKeys.map(key => {
                        db.collection("nodes").deleteOne({ _id: ObjectId(key) })
                    });
                    await Promise.all(removePromises);
                    deletedNodes = removedNodeKeys;
                }
                await pubsub.publish(DIAGRAM_UPDATED, { diagramUpdated: { updatedNodes, deletedNodes }});
                return true;
            },
            addNode: async (_, args) => {
                const newNode = { text: args.text, location: args.location, stroke: args.stroke, angle: 0 };
                const { result, ops } = await db.collection("nodes").insertOne(newNode);
                if (!result.ok) {
                    return false;
                }
                await pubsub.publish(DIAGRAM_UPDATED, { diagramUpdated: { addedNodes: ops } });
                return true;
            }
        }
    };

    return new ApolloServer({
        typeDefs,
        resolvers,
        playground: true,
        introspection: true
    });
}

module.exports = { startApollo };