import * as React from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import { ObjectID } from "mongodb";

import "./Diagram.css";

const initDiagram = () => {
    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, 
        { 
            "undoManager.isEnabled": true,
            model: $(go.GraphLinksModel, {
                nodeKeyProperty: "_id",
                linkKeyProperty: "_id",
                makeUniqueKeyFunction: () => String(new ObjectID())
            })
        });

    diagram.nodeTemplate = (
        $(go.Node, go.Node.Auto,
            $(go.TextBlock,
                {
                    stroke: "gray",
                },
                new go.Binding("text").makeTwoWay(),
                new go.Binding("stroke").makeTwoWay()
            ),
            new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify),
            new go.Binding("angle").makeTwoWay()
        )
    );

    const { commandHandler } = diagram;
    commandHandler.pasteSelection = function() {
        const transaction = "CustomPaste";
        diagram.startTransaction(transaction);
        const position = diagram.lastInput.documentPoint;
        go.CommandHandler.prototype.pasteSelection.call(commandHandler, position);
        diagram.commitTransaction(transaction);
    }

    return diagram;
};

const Diagram = React.forwardRef<ReactDiagram, any>((props: any, ref) => {
    const { 
        nodes, onModelChange, shouldSkipUpdate, avoidNextUpdates 
    } = props;

    React.useEffect(() => {
        // The only time when we actually want to manually apply an update 
        // to the diagram is when we get back new data from our server. 
        // Otherwise we can assume that GoJS has already taken care of 
        // updating its own state. Therefore, as soon as we have applied 
        // the server update (that is, when `shouldSkipUpdate` is false),
        // we turn it back to true by calling `avoidNextUpdates`.
        if (!shouldSkipUpdate) {
            avoidNextUpdates();
        }
    }, [shouldSkipUpdate, avoidNextUpdates]);

    return (
        <ReactDiagram
            ref={ref}
            initDiagram={initDiagram}
            divClassName="diagram"
            nodeDataArray={nodes}
            onModelChange={onModelChange}
            skipsDiagramUpdate={shouldSkipUpdate}
        />
    );
});

export default Diagram;
