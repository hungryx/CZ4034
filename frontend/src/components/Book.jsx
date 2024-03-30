import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import data from "../data.json";

const Book = () => {
  const { id } = useParams();

  const [bookInfo, setBookInfo] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const book = data.filter((item) => item.id == id)[0];
    setBookInfo(book);

    let comments = [];
    book.comments.map((item) => {
      comments.push(item);
    });
    setComments(comments);
  }, []);

  const goBack = () => {
    history.back();
  };

  return (
    <div className="book">
      <button onClick={goBack}>back</button>
      <p>{bookInfo.title}</p>
      <p>comments:</p>
      <div className="commentsDiv">
        <div className="commentDiv">
          <p>comment</p>
          <p>sentiment</p>
        </div>
        {comments.map((item) => (
          <div className="commentDiv">
            <p>{item.comment}</p>
            <p>{item.sentiment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Book;
