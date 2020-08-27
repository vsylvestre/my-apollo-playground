import * as React from "react";
import { gql } from "@apollo/client/core";
import { useMutation, useQuery } from "@apollo/client/react";
import Context from "./Context";

const GET_NODES = gql`
    query {
        nodes {
            _id
        }
    }
`;

const ADD_NODE = gql`
    mutation addNode($text: String!, $location: String!, $stroke: String!) {
        addNode(text: $text, location: $location, stroke: $stroke)
    }
`;

function AddNodeButton() {
    const { data } = useQuery(GET_NODES);

    const [addNode] = useMutation(ADD_NODE);

    const numberOfNodes = data?.nodes.length || 0;

    const addOneNode = () => {
        addNode({ variables: { text: `Node${numberOfNodes + 1}`, location: `${numberOfNodes * 10} ${numberOfNodes * 10}`, stroke: "grey" } });
    };

    return (
        <button type="button" onClick={addOneNode}>
            Add node
        </button>
    )
}

function RotateNodesButton() {
    const { diagram } = React.useContext(Context);

    if (!diagram) {
        return null;
    }

    const rotateAllNodes = () => {
        const transaction = "RotateAllNodes";
        diagram.startTransaction(transaction);
        diagram.nodes.each(node => node.angle += 90);
        diagram.commitTransaction(transaction)
    };

    return (
        <button type="button" onClick={rotateAllNodes}>
            Rotate all nodes
        </button>
    );
}

export { AddNodeButton, RotateNodesButton };
