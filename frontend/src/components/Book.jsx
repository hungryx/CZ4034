import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import filterIcon from "../assets/filterIcon.svg";
import Graph from "./Graph";

const Book = () => {
  const { id } = useParams();

  // data
  const [solrComments, setSolrComments] = useState([]);
  const [book, setBook] = useState([]);

  // for fitering & sorting
  const sentimentList = [
    { str: "Positive", val: 1 },
    { str: "Neutral", val: 2 },
    { str: "Negative", val: 0 },
  ];
  const [dateArrow, setDateArrow] = useState("desc");

  const [selectedSentiments, setSelectedSentiments] = useState(
    sentimentList.map((sentiment) => sentiment.val)
  );
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const sentimentTableStyle = (sentiment) => {
    if (sentiment === 0) {
      return { backgroundColor: "rgb(191,16,41)" };
    } else if (sentiment === 1) {
      return { backgroundColor: "rgb(117,145,22)" };
    } else if (sentiment === 2) {
      return { backgroundColor: "rgb(255,178,52)" };
    }
  };
  const sentimentCheckboxStyle = (sentiment) => {
    if (sentiment === 0) {
      return { color: "rgb(191,16,41)" };
    } else if (sentiment === 1) {
      return { color: "rgb(117,145,22)" };
    } else if (sentiment === 2) {
      return { color: "rgb(255,178,52)" };
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

  const handleFilter = (sentiment) => {
    const isSentimentSelected = selectedSentiments.includes(sentiment);

    let updatedSentiments;
    if (isSentimentSelected) {
      updatedSentiments = selectedSentiments.filter(
        (selectedSentiment) => selectedSentiment !== sentiment
      );
    } else {
      updatedSentiments = [...selectedSentiments, sentiment];
    }
    if (updatedSentiments.length === 0) {
      updatedSentiments = sentimentList.map((sentiment) => sentiment.val);
    }
    setSelectedSentiments(updatedSentiments);

    const sentimentLiteral = updatedSentiments.join("%20OR%20");

    const solrUrl = `http://localhost:8983/solr/new_core/select?q=book:"${id}"&q.op=OR&fq=TYPE:COMMENT&fq=sentiment:(${sentimentLiteral})&indent=true&rows=10000`;
    getData(solrUrl);
  };
  const handleSort = () => {
    setDateArrow(dateArrow === "asc" ? "desc" : "asc");

    const sortedComments = solrComments.sort((a, b) => {
      const dateA = new Date(a.created_utc);
      const dateB = new Date(b.created_utc);
      if (dateArrow === "desc") {
        return dateA - dateB;
      } else if (dateArrow === "asc") {
        return dateB - dateA;
      } else {
        return 0;
      }
    });

    setSolrComments(sortedComments);
  };

  // const sortDate = (field, sortBy) => {
  //   const solrUrl = `http://localhost:8983/solr/new_core/select?q=book:"${id}"&q.op=OR&fq=TYPE:COMMENT&sort=${field}%20${sortBy}&indent=true&rows=10000`;
  //   getData(solrUrl);
  // };

  const getData = async (solrUrl) => {
    const res = await axios.get(solrUrl);
    const documents = res.data.response.docs;
    // console.log(documents);
    setSolrComments(documents);
  };
  const getBookData = async (solrUrl) => {
    const res = await axios.get(solrUrl);
    const documents = res.data.response.docs;
    setBook(documents[0]);
  };

  useEffect(() => {
    const solrUrl = `http://localhost:8983/solr/new_core/select?q=book:"${id}"&q.op=OR&fq=TYPE:COMMENT&fq=sentiment:(-3)&indent=true&rows=10000`;
    getData(solrUrl);

    const bookUrl = `http://localhost:8983/solr/new_core/select?q=book_title:"${id}"&q.op=OR&fq=table:books&indent=true&rows=10000`;
    getBookData(bookUrl);

    // const book = data.filter((item) => item.id == id)[0];
    // setBookInfo(book);

    // let comments = [];
    // let sentimentSum = 0;
    // book.comments.map((item) => {
    //   sentimentSum += item.sentiment;
    //   comments.push(item);
    // });
    // setComments(comments);

    // setSentimentInfo({
    //   length: comments.length,
    //   sum: sentimentSum.toFixed(2),
    //   average: (sentimentSum / comments.length).toFixed(2),
    // });
  }, []);

  const goBack = () => {
    history.back();
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = solrComments.slice(indexOfFirstRow, indexOfLastRow);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(solrComments.length / rowsPerPage);
  const pagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));

  return (
    <div className="bookPage">
      <button className="backBtn" onClick={goBack}>
        back
      </button>
      <div className="bookInfo">
        <img
          src={"." + book.cover_path + ".jpg"}
          alt="Book Image"
          className="image"
        />
        <div className="details">
          <h1 className="bookTitle">{id}</h1>

          <p>Category: {book.category}</p>
          <p>Author: {book.book_author}</p>
          <p>Publication Date: {book.publication_date}</p>
          <p>
            Description:<br></br>
            {book.description}
          </p>
        </div>
        <div>
          <p>Total Comments: {solrComments.length}</p>
          <Graph data={solrComments} />
        </div>
      </div>

      <div>
        {solrComments.length > rowsPerPage && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="pages">
              <div
                style={
                  currentPage > Math.ceil(pagesToShow / 2)
                    ? {}
                    : { color: "transparent" }
                }
              >
                ...
              </div>
              {Array(pagesToShow)
                .fill()
                .map((_, i) => {
                  const pageNumber = i + startPage;
                  return (
                    <button
                      key={pageNumber}
                      className="pageBtn"
                      onClick={() => paginate(pageNumber)}
                      style={
                        pageNumber === currentPage
                          ? { backgroundColor: "rgb(135, 196, 225)" }
                          : {}
                      }
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              <div
                style={
                  currentPage < totalPages - Math.ceil(pagesToShow / 2)
                    ? {}
                    : { color: "transparent" }
                }
              >
                ...
              </div>
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <table className="bookTable">
        <thead>
          <tr>
            <th className="comment">Comment</th>
            <th className="date">
              <span>Date</span>
              <button className="sortArrow" onClick={handleSort}>
                {dateArrow === "asc" ? "▲" : "▼"}
              </button>
            </th>
            <th className="sentiment">
              <span>Sentiment </span>
              <span>
                <img
                  src={filterIcon}
                  alt="filterIcon"
                  width="13"
                  height="13"
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
                          id={sentiment.str}
                          value={sentiment.val}
                          checked={selectedSentiments.includes(sentiment.val)}
                          onChange={() => handleFilter(sentiment.val)}
                        />
                        <label
                          for={sentiment.str}
                          style={sentimentCheckboxStyle(sentiment.val)}
                        >
                          {sentiment.str}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((item, index) => (
            <tr key={index}>
              <td className="comment">{item.comment_text}</td>
              <td className="date">{item.created_utc.split("T")[0]}</td>
              <td
                className="sentiment"
                style={sentimentTableStyle(item.sentiment)}
              >
                {(() => {
                  switch (item.sentiment) {
                    case 0:
                      return "Negative";
                    case 1:
                      return "Positive";
                    case 2:
                      return "Neutral";
                    case 3:
                      return "Irrelevant";
                    default:
                      return "Unknown";
                  }
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Showing results {indexOfFirstRow + 1} to {indexOfLastRow}
      </p>
    </div>
  );
};

export default Book;
