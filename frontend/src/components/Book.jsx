import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import data from "../data.json";

const Book = () => {
  const { id } = useParams();

  const [bookInfo, setBookInfo] = useState([]);
  const [comments, setComments] = useState([]);
  const [sentimentInfo, setSentimentInfo] = useState([]);

  const sentimentTableStyle = (sentiment) => {
    if (sentiment >= 0.6) {
      return { backgroundColor: "rgb(117,145,22)" };
    } else if (sentiment < 0.5) {
      return { backgroundColor: "rgb(191,16,41)" };
    } else {
      return {};
    }
  };
  const sentimentDescStyle = (sentiment) => {
    if (sentiment >= 0.6) {
      return { color: "rgb(117,145,22)" };
    } else if (sentiment < 0.5) {
      return { color: "rgb(191,16,41)" };
    } else {
      return {};
    }
  };

  useEffect(() => {
    const book = data.filter((item) => item.id == id)[0];
    setBookInfo(book);

    let comments = [];
    let sentimentSum = 0;
    book.comments.map((item) => {
      sentimentSum += item.sentiment;
      comments.push(item);
    });
    setComments(comments);

    setSentimentInfo({
      length: comments.length,
      sum: sentimentSum.toFixed(2),
      average: (sentimentSum / comments.length).toFixed(2),
    });
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
      <div className="bookInfo">
        <div className="image">IMAGE</div>
        <div className="details">
          <p>Description: </p>
          <p>Genre: {bookInfo.genre}</p>
          <p>Total Comments: {sentimentInfo.length}</p>
          <p>
            Average Sentiment:{" "}
            <span style={sentimentDescStyle(sentimentInfo.average)}>
              {sentimentInfo.average}
            </span>
          </p>
        </div>
      </div>
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
              <td
                className="sentiment"
                style={sentimentTableStyle(item.sentiment)}
              >
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
