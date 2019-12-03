import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo";

const ADD_NODE = gql`
    mutation addNode($text: String!) {
        addNode(text: $text)
    }
`;

function AddNodeButton({ numberOfNodes }) {
    const [addNode] = useMutation(ADD_NODE);

    const addOneNode = () => {
        addNode({ variables: { text: `Node${numberOfNodes + 1}` } });
    };

    return (
        <button type="button" onClick={addOneNode}>
            Add node
        </button>
    )
}

export default AddNodeButton;
