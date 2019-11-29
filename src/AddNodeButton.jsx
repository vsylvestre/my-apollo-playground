import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo";

const ADD_NODE = gql`
    mutation addNode($text: String!) {
        addNode(text: $text)
    }
`;

function AddNodeButton({ refetchNodes }) {
    const [addNode] = useMutation(ADD_NODE);

    const [nodeCount, setNodeCount] = useState(1);

    const addOneNode = () => {
        setNodeCount(nodeCount + 1);
        addNode({ variables: { text: `Node${nodeCount}` } });
        refetchNodes();
    };

    return (
        <button type="button" onClick={addOneNode}>
            Add node
        </button>
    )
}

export default AddNodeButton;
