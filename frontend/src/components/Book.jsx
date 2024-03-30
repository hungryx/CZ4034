import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import data from "../data.json";

const Book = () => {
  const { id } = useParams();

  const [bookInfo, setBookInfo] = useState([]);

  useEffect(() => {
    setBookInfo(data.filter((item) => item.id == id)[0]);
  }, []);

  const goBack = () => {
    history.back();
  };

  return (
    <div className="book">
      <button onClick={goBack}>back</button>
      <p>title: {bookInfo.title}</p>
      {bookInfo.comments}
    </div>
  );
};

export default Book;
