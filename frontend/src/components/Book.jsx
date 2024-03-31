import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import data from "../data.json";

const Book = () => {
  const { id } = useParams();

  const [bookInfo, setBookInfo] = useState([]);
  const [comments, setComments] = useState([]);

  const getRowStyle = (sentiment) => {
    if (sentiment >= 0.6) {
      return { backgroundColor: "rgb(117,145,22)" };
    } else if (sentiment < 0.5) {
      return { backgroundColor: "rgb(191,16,41)" };
    } else {
      return {};
    }
  };

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
    <div className="bookPage">
      <button className="backBtn" onClick={goBack}>
        back
      </button>
      <h1 className="bookTitle">{bookInfo.title}</h1>
      <table className="bookTable">
        <thead>
          <tr>
            <th className="comment">Comment</th>
            <th className="sentiment">Sentiment</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((item, index) => (
            <tr key={index}>
              <td className="comment">{item.comment}</td>
              <td className="sentiment" style={getRowStyle(item.sentiment)}>
                {item.sentiment}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Book;
