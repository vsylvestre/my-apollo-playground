import * as React from "react";
import * as go from "gojs";
import { gql } from "@apollo/client/core";
import { useQuery, useSubscription, useMutation, useApolloClient } from "@apollo/client";
import { ReactDiagram } from "gojs-react";
import Diagram from "./Diagram";

import "./Diagram.css";

export const NodeFragment = gql`
    fragment Node on Node {
        _id
        text
        location
        stroke
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
        }
    }
    ${NodeFragment}
`;

function DiagramContainer() {
    const client = useApolloClient();

    const shouldSkipUpdate = React.useRef<boolean>(false);

    // This will be called when the component mounts, in order to get
    // the initial list of nodes from the DB (and, in turn, store it
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
    // the DB, because the objects the DB return might be different
    // from the ones we sent.
    const { data: subscriptionData } = useSubscription(DIAGRAM_UPDATED);

    React.useEffect(() => {
        const diagram = diagramRef.current?.getDiagram();
        if (diagram) {
            const { addedNodes, updatedNodes } = subscriptionData?.diagramUpdated;
            if (addedNodes || updatedNodes) {
                shouldSkipUpdate.current = false;
            }
            if (addedNodes) {
                client.writeQuery({
                    query: GET_DIAGRAM,
                    data: {
                        nodes: [...data?.nodes, ...addedNodes]
                    }
                })
            }
            if (updatedNodes) {
                const updatedNodesIDs = updatedNodes.map((node: any) => node._id);
                client.writeQuery({
                    query: GET_DIAGRAM,
                    data: {
                        nodes: [
                            ...data?.nodes.filter(({ _id }: any) => !updatedNodesIDs.includes(_id)),
                            ...updatedNodes
                        ]
                    }
                })
            }
        }
    }, [subscriptionData]);

    const onModelChange = React.useCallback((obj: go.IncrementalData) => {
        if (!shouldSkipUpdate.current) {
            shouldSkipUpdate.current = true;
            return;
        }
        updateDiagram({ variables: { json: JSON.stringify(obj) } });
    }, [updateDiagram]);

    if (loading) {
        return "Loading...";
    }

    if (error) {
        return "Something went wrong.";
    }

    return (
        <Diagram
            ref={diagramRef}
            nodes={data?.nodes || []}
            onModelChange={onModelChange}
            shouldSkipUpdate={shouldSkipUpdate.current}
        />
    );
}

export default DiagramContainer;
