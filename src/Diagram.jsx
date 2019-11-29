import React from "react";
import gql from "graphql-tag";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import { useQuery } from "react-apollo";

import "./Diagram.css";
import AddNodeButton from "./AddNodeButton";

const GET_NODES = gql`
    query {
        nodes {
            _id
            text
        }
    }
`;

function Diagram() {
    const { data, loading, error, refetch } = useQuery(GET_NODES);

    if (loading) {
        return "Loading...";
    }

    if (error) {
        return "Something went wrong.";
    }

    const initDiagram = () => {
        const $ = go.GraphObject.make;
        const diagram = $(go.Diagram);
        diagram.nodeTemplate = (
            $(go.Node, go.Node.Auto,
                $(go.TextBlock, 
                    {
                        stroke: "gray"
                    },
                    new go.Binding("text", "key")
                )
            )
        );
        return diagram;
    };

    const nodes = data && data.nodes.map(node => ({ key: node.text }));

    return (
        <>
            <ReactDiagram
                initDiagram={initDiagram}
                divClassName="diagram"
                nodeDataArray={nodes || [{ key: "Node" }]}
            />
            <AddNodeButton 
                refetchNodes={refetch} 
            />
        </>
    );
}

export default Diagram;
