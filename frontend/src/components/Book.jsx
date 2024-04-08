import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import data from "../data.json";
import filterIcon from "../assets/filterIcon.svg";

const Book = () => {
  const { id } = useParams();
  const sentimentList = ["Positive", "Neutral", "Negative"];

  const [bookInfo, setBookInfo] = useState([]);
  const [comments, setComments] = useState([]);
  const [sentimentInfo, setSentimentInfo] = useState([]);

  const [sortBy, setSortBy] = useState("");
  const [selectedSentiments, setSelectedSentiments] = useState(sentimentList);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const sentimentTableStyle = (sentiment) => {
    if (sentiment >= 0.8) {
      return { backgroundColor: "rgb(117,145,22)" };
    } else if (sentiment <= 0.4) {
      return { backgroundColor: "rgb(191,16,41)" };
    } else {
      return { backgroundColor: "rgb(255,178,52)" };
    }
  };
  const sentimentDescStyle = (sentiment) => {
    if (sentiment >= 0.8) {
      return { color: "rgb(117,145,22)" };
    } else if (sentiment <= 0.4) {
      return { color: "rgb(191,16,41)" };
    } else {
      return { color: "rgb(255,178,52)" };
    }
  };
  const sentimentCheckboxStyle = (sentiment) => {
    if (sentiment === "Positive") {
      return { color: "rgb(117,145,22)" };
    } else if (sentiment === "Negative") {
      return { color: "rgb(191,16,41)" };
    } else {
      return { color: "rgb(255,178,52)" };
    }
  };

  const handleSort = () => {
    setSortBy(sortBy === "asc" ? "desc" : "asc");
  };

  const handleFilter = (sentiment) => {
    const isSentimentSelected = selectedSentiments.includes(sentiment);

    if (isSentimentSelected) {
      const updatedSentiments = selectedSentiments.filter(
        (selectedSentiment) => selectedSentiment !== sentiment
      );
      setSelectedSentiments(updatedSentiments);
    } else {
      const updatedSentiments = [...selectedSentiments, sentiment];
      setSelectedSentiments(updatedSentiments);
    }
  };

  const filteredComments = comments.filter((item) => {
    let results = [];
    selectedSentiments.forEach((sentiment) => {
      if (sentiment === "Neutral") {
        results.push(item.sentiment > 0.4 && item.sentiment < 0.8);
      } else if (sentiment === "Positive") {
        results.push(item.sentiment >= 0.8);
      } else if (sentiment === "Negative") {
        results.push(item.sentiment <= 0.4);
      }
    });
    return results.some((result) => result);
  });

  const sortedComments = filteredComments.sort((a, b) => {
    if (sortBy === "asc") {
      return a.sentiment - b.sentiment;
    } else if (sortBy === "desc") {
      return b.sentiment - a.sentiment;
    } else {
      return 0; // no sorting
    }
  });

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
            <th className="sentiment sentHead">
              <p>Sentiment </p>
              <button className="sentimentSort" onClick={handleSort}>
                {sortBy === "asc" ? "▲" : "▼"}
              </button>
              <div>
                <img
                  src={filterIcon}
                  alt="filterIcon"
                  width="16"
                  height="16"
                  className="sentimentDropdown"
                  onMouseEnter={toggleDropdown}
                />

                {isOpen && (
                  <div
                    className="sentimentCheckbox"
                    onMouseLeave={toggleDropdown}
                  >
                    {sentimentList.map((sentiment) => (
                      <div className="sentimentSelect">
                        <input
                          type="checkbox"
                          name="sentiment"
                          id={sentiment}
                          value={sentiment}
                          checked={selectedSentiments.includes(sentiment)}
                          onChange={() => handleFilter(sentiment)}
                        />
                        <label
                          for={sentiment}
                          style={sentimentCheckboxStyle(sentiment)}
                        >
                          {sentiment}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedComments.map((item, index) => (
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
