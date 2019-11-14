import React from "react";
import { useQuery } from "react-apollo";
import gql from "graphql-tag";

import "./List.css";

const GET_ITEMS = gql`
  query {
    items {
      _id
      content
      isDone
    }
  }
`;

function List() {
  const { data, loading, error } = useQuery(GET_ITEMS);

  if (loading) {
    return "We're loading data...";
  }

  console.log(data);

  return (
    <div className='list'>
      {data.items.map((item) => (
        <span key={item._id}>{item.content}</span>
      ))}
    </div>
  );
}

export default List;