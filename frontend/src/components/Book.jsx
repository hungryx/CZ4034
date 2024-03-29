import { useState } from "react";
import { useParams } from "react-router-dom";

import data from "../data.json";

const Book = () => {
  const { id } = useParams();
  return (
    <div className="book">
      {data
        .filter((item) => item.id == id)
        .map((filteredItem) => (
          <p>title: {filteredItem.title}</p>
        ))}
    </div>
  );
};

export default Book;
