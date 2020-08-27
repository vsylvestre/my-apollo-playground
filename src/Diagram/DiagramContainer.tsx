import * as React from "react";
import * as go from "gojs";
import { gql } from "@apollo/client/core";
import { useQuery, useSubscription, useMutation } from "@apollo/client";
import { ReactDiagram } from "gojs-react";
import { AddNodeButton, RotateNodesButton } from "./Buttons";
import useApolloUtils from "../_hooks/useApolloUtils";
import Diagram from "./Diagram";
import Context from "./Context";

type Node = {
    _id: string
    text: string
    location: string
    stroke: string
    angle: number
};

export const NodeFragment = gql`
    fragment Node on Node {
        _id
        text
        location
        stroke
        angle
    }
`;

export const GET_DIAGRAM = gql`
    query {
        nodes {
            ...Node
        }
    }
    ${NodeFragment}
`;

const UPDATE_DIAGRAM = gql`
    mutation updateDiagram($json: String!) {
        updateDiagram(json: $json)
    }
`;

const DIAGRAM_UPDATED = gql`
    subscription {
        diagramUpdated {
            addedNodes {
                ...Node
            }
            updatedNodes {
                ...Node
            }
            deletedNodes
        }
    }
    ${NodeFragment}
`;

function DiagramContainer() {
    const { addElementsToCache, updateElementsInCache, removeElementsFromCache } = useApolloUtils();

    const shouldSkipUpdate = React.useRef<boolean>(false);

    // This will be called when the component mounts, in order to get
    // the initial list of nodes from the server (and, in turn, store it
    // in the cache automatically). It will also be refreshed when
    // there are updates to our cache.
    const { data, loading, error } = useQuery(GET_DIAGRAM);

    // This will be called every time there is an incremental change
    // from GoJS. We ignore results because we assume that they will
    // go through the DIAGRAM_UPDATED event.
    const [updateDiagram] = useMutation(UPDATE_DIAGRAM, { ignoreResults: true });

    const diagramRef = React.useRef<ReactDiagram | null>(null);

    // Here, we subscribe to events of diagram updates. This will be 
    // triggered by our GraphQL server every time there's a mutation
    // that is called that modifies something on the diagram. Namely,
    // this will be called every time there's a model update sent to
    // the server, because the objects the server return might be 
    // different from the ones we sent.
    const { data: subscriptionData } = useSubscription(DIAGRAM_UPDATED);

    React.useEffect(() => {
        if (subscriptionData) {
            const { addedNodes, updatedNodes, deletedNodes } = subscriptionData?.diagramUpdated;
            if (addedNodes || updatedNodes || deletedNodes) {
                // If we're here, it's because `subscriptionData` was updated.
                // If `subscriptionData` was updated, it's because the server sent
                // back information following a model update (or an external
                // update). Therefore, it's possible that the GoJS state be
                // different from what's stored in our DB right now, and we want
                // to make sure that those changes that were possibly applied by
                // the server are also present on our diagram.
                shouldSkipUpdate.current = false;
            }
            if (addedNodes) {
                addElementsToCache<Node>(addedNodes, "Nodes");
            }
            if (updatedNodes) {
                updateElementsInCache<Node>(updatedNodes, "Nodes");
            }
            if (deletedNodes) {
                removeElementsFromCache(deletedNodes, "Nodes");
            }
        }
    }, [subscriptionData, addElementsToCache, updateElementsInCache, removeElementsFromCache]);

    const onModelChange = React.useCallback((obj: go.IncrementalData) => {
        // If `shouldSkipUpdate` was set to false, that means we had
        // an update coming in from the server that we wanted to manually
        // apply to GoJS. That also means the server is _already_ aware
        // of that change, and we don't need to call `updateDiagram`
        // again. Otherwise we'll enter an infinite loop.
        if (!shouldSkipUpdate.current) {
            return;
        }
        updateDiagram({ variables: { json: JSON.stringify(obj) } });
    }, [updateDiagram]);

    // We call this when we need to set back `shouldSkipUpdate`
    // to true. We actually call this from `Diagram.tsx` once 
    // GoJS has applied an update that we got from the server
    const avoidNextUpdates = React.useCallback(() => {
        shouldSkipUpdate.current = true;
    }, []);

    if (loading) {
        return "Loading...";
    }

    if (error) {
        return "Something went wrong.";
    }

    return (
        <Context.Provider value={{ diagram: diagramRef.current?.getDiagram() || null } }>
            <Diagram
                ref={diagramRef}
                nodes={data?.nodes || []}
                onModelChange={onModelChange}
                shouldSkipUpdate={shouldSkipUpdate.current}
                avoidNextUpdates={avoidNextUpdates}
            />
            <AddNodeButton />
            <RotateNodesButton />
        </Context.Provider>
    );
}

export default DiagramContainer;
