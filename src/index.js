import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "@apollo/client";
import DiagramContainer from "./Diagram/DiagramContainer";
import useApolloClient from "./useApolloClient";

function App() {
    const client = useApolloClient();

    return (
        <ApolloProvider client={client}>
            <DiagramContainer />
        </ApolloProvider>
    );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);