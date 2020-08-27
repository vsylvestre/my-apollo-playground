import * as React from "react";
import * as go from "gojs";

export type ContextType = {
    diagram: go.Diagram | null
}

const Context = React.createContext<ContextType>({ diagram: null });

export default Context;