import * as React from "react";
import { useApolloClient, StoreObject } from "@apollo/client";

export default function useApolloUtils() {
    const client = useApolloClient();

    const addElementsToCache = React.useCallback(
        function addElementsToCache<T>(newElements: T[], typename: string) {
            client.cache.modify({
                fields: {
                    [typename.toLowerCase()](currentElements) {
                        return [...currentElements, ...newElements];
                    }
                }
            });
        }, [client.cache]
    );

    const updateElementsInCache = React.useCallback(
        function updateElementsInCache<T>(updatedElements: T[], typename: string, identifier: string = "_id") {
            const updatedElementIdentifiers = updatedElements.map<string>((node: T) => (node as any)[identifier]);
            client.cache.modify({
                fields: {
                    [typename.toLowerCase()](currentElements, { readField }) {
                        return [
                            ...currentElements.filter((element: StoreObject) => {
                                const elementId = readField<string>(identifier, element);
                                return !elementId ? false : !updatedElementIdentifiers.includes(elementId);    
                            }),
                            ...updatedElements
                        ];
                    }
                }
            });
        }, [client.cache]
    );

    const removeElementsFromCache = React.useCallback(
        function removeElementsFromCache(ids: string[], typename: string, identifier: string = "_id") {
            client.cache.modify({
                fields: {
                    [typename.toLowerCase()](currentElements, { readField }) {
                        return currentElements.filter((element: StoreObject) => {
                            const elementId = readField<string>(identifier, element);
                            return !elementId ? false : !ids.includes(elementId);
                        });
                    }
                }
            });
        }, [client.cache]
    );

    return { addElementsToCache, updateElementsInCache, removeElementsFromCache };
}