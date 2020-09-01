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
                const { modifiedNodeData, removedNodeKeys, insertedNodeKeys } = JSON.parse(args.json);
                let updatedNodes = null, deletedNodes = null, addedNodes = null;
                if (insertedNodeKeys) {
                    const insertPromises = insertedNodeKeys.map(async (key) => {
                        const addedNode = modifiedNodeData.find(({ _id }) => _id === key);
                        const { ops: [node] } = await db.collection("nodes").insertOne({ ...addedNode, _id: ObjectId(addedNode._id) });
                        return node;
                    });
                    addedNodes = await Promise.all(insertPromises);
                }
                if (modifiedNodeData) {
                    const updatedNodeData = insertedNodeKeys
                        ? modifiedNodeData.filter(({ _id }) => !insertedNodeKeys.includes(_id))
                        : modifiedNodeData;
                    if (updatedNodeData.length > 0) {
                        const strokeArray = ["red", "grey", "blue", "green", "yellow", "black", "purple"];
                        const newNodes = updatedNodeData.map(node => ({ ...node, stroke: strokeArray[Math.floor(Math.random() * strokeArray.length)] }));
                        const updatePromises = newNodes.map(node => {
                            const { _id, ...nodeWithoutId } = node;
                            db.collection("nodes").replaceOne({ _id: ObjectId(_id) }, nodeWithoutId);
                        });
                        await Promise.all(updatePromises);
                        updatedNodes = newNodes;
                    }
                }
                if (removedNodeKeys) {
                    const removePromises = removedNodeKeys.map(key => {
                        db.collection("nodes").deleteOne({ _id: ObjectId(key) })
                    });
                    await Promise.all(removePromises);
                    deletedNodes = removedNodeKeys;
                }
                await pubsub.publish(DIAGRAM_UPDATED, { diagramUpdated: { updatedNodes, deletedNodes, addedNodes }});
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