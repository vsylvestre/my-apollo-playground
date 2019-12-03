import React from "react";
import gql from "graphql-tag";
import { useQuery, useSubscription, useMutation } from "react-apollo";
import DiagramModelChange from "./DiagramModelChange";
import Diagram from "./Diagram";

import "./Diagram.css";

const GET_NODES = gql`
    query {
        nodes {
            _id
            text
        }
    }
`;

const DELETE_NODE = gql`
    mutation deleteNode($id: String!) {
        deleteNode(id: $id)
    }
`;

const NODE_ADDED_SUBSCRIPTION = gql`
    subscription {
        nodeAdded {
            _id
            text
        }
    }
`;

function DiagramContainer() {
    // This will be called when the component mounts, in order to get
    // the initial list of nodes from the DB (and, in turn, store it
    // in the cache automatically).
    const { data, loading, error, refetch: refetchNodes } = useQuery(GET_NODES);

    // We will apply this mutation whenever we detect from the diagram
    // that a node was deleted. Note that we _ignore the result_, meaning
    // that we avoid refreshing this component (and, therefore, the diagram)
    // for no reason, since GoJS already takes care of that update!
    const [deleteNode] = useMutation(DELETE_NODE, { ignoreResults: true });

    // Here, we subscribe to events of nodes added to the cache. This way,
    // we can reflect this change in GoJS. This is, basically, the equivalent
    // of "adding a node programmatically". Also, a similar type of
    // subscription could be used to update nodes on the diagram following an
    // external change in their properties (similar to updateTargetBindings).
    useSubscription(NODE_ADDED_SUBSCRIPTION, { onSubscriptionData: () => refetchNodes() });

    if (loading) {
        return "Loading...";
    }

    if (error) {
        return "Something went wrong.";
    }

    const onModelChange = (event, data) => {
        switch (event) {
          case DiagramModelChange.NODE_DELETED:
            deleteNode({ variables: data });
            break;
          default:
            // Of course, we would see more events here eventually, such
            // as NODE_UPDATED, LINK_DELETED, LINK_UPDATED, etc. Basically,
            // anything that is done internally on GoJS's side but that we
            // want to reflect in our cache.
        }
    };

    return (
        <Diagram nodes={data.nodes || []} onModelChange={onModelChange} />
    );
}

export default DiagramContainer;
