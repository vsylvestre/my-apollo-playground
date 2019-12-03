import React from "react";
import gql from "graphql-tag";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import AddNodeButton from "./AddNodeButton";
import DiagramModelChange from "./DiagramModelChange";

import "./Diagram.css";

function Diagram(props) {
    const { nodes, onModelChange } = props;

    const initDiagram = () => {
        const $ = go.GraphObject.make;
        const diagram = $(go.Diagram, { 'undoManager.isEnabled': true });
        diagram.nodeTemplate = (
            $(go.Node, go.Node.Auto,
                $(go.TextBlock,
                    {
                        stroke: "gray"
                    },
                    new go.Binding("text").makeTwoWay()
                )
            )
        );
        return diagram;
    };

    const handleModelChange = (obj) => {
        if (obj.removedNodeKeys.length > 0) {
            onModelChange(DiagramModelChange.NODE_DELETED, obj.removedNodeKeys[0]);
        }
        if (obj.modifiedNodeData) {
            onModelChange(DiagramModelChange.NODE_UPDATED, obj.modifiedNodeData);
        }
    };

    return (
        <>
            <ReactDiagram
                initDiagram={initDiagram}
                divClassName="diagram"
                nodeDataArray={nodes.map(node => ({ ...node, key: node._id }))}
                onModelChange={handleModelChange}
            />
            <AddNodeButton
                numberOfNodes={nodes.length || 0}
            />
        </>
    );
}

export default Diagram;
