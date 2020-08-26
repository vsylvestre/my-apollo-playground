import * as React from "react";
import { gql } from "@apollo/client/core";
import { useMutation, useQuery } from "@apollo/client/react";

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

export default AddNodeButton;
