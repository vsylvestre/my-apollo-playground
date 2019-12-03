# Demo of a GoJS Diagram with React and Apollo GraphQL

## Description

The goal of this demo is to have the new [GoJS ReactDiagram](https://gojs.net/latest/intro/react.html) element work using Apollo GraphQL for data fetching.

We want to fetch and update our diagram data using Apollo GraphQL, while ensuring that there is no desynchronization of the Apollo cache with the internal state of the GoJS diagram. Then, we want to use React in order to display our diagram.

## Getting Started

First of all, install dependencies using

```
npm install
```

or

```
yarn
```

Then, make sure that you install and launch a local instance of MongoDB. (On Mac, you can use the `mongod` command directly, but on Windows, you might need to navigate to the program directory and launch it manually.)

Finally, launch the application using

```
npm run start
```

or

```
yarn run start
```