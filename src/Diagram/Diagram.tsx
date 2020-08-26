import * as React from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import AddNodeButton from "./AddNodeButton";

import "./Diagram.css";

const initDiagram = () => {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, 
        { 
            "undoManager.isEnabled": true,
            model: $(go.GraphLinksModel, {
                linkKeyProperty: "key"
            })
        });
    diagram.nodeTemplate = (
        $(go.Node, go.Node.Auto,
            $(go.TextBlock,
                {
                    stroke: "gray"
                },
                new go.Binding("text").makeTwoWay(),
                new go.Binding("stroke").makeTwoWay()
            ),
            new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify)
        )
    );
    return diagram;
};

const Diagram = React.forwardRef<ReactDiagram, any>((props: any, ref) => {
    const { nodes, onModelChange, shouldSkipUpdate } = props;

    const makeNode = React.useCallback((node: any) => ({
        ...node, 
        key: node._id
    }), []);

    return (
        <>
            <ReactDiagram
                ref={ref}
                initDiagram={initDiagram}
                divClassName="diagram"
                nodeDataArray={nodes.map(makeNode)}
                onModelChange={onModelChange}
                skipsDiagramUpdate={shouldSkipUpdate}
            />
            <AddNodeButton />
        </>
    );
});

export default Diagram;
