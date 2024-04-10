import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import data from "../data.json";
import filterIcon from "../assets/filterIcon.svg";

const Book = () => {
  const { id } = useParams();

  // data
  const [bookInfo, setBookInfo] = useState([]);
  const [comments, setComments] = useState([]);
  const [sentimentInfo, setSentimentInfo] = useState([]);

  const [solrComments, setSolrComments] = useState([]);

  // for fitering & sorting
  const sentimentList = ["Positive", "Neutral", "Negative"];
  const [dateArrow, setDateArrow] = useState("desc");
  const [sentimentArrow, setSentimentArrow] = useState("desc");

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

  // const filteredComments = comments.filter((item) => {
  //   let results = [];
  //   selectedSentiments.forEach((sentiment) => {
  //     if (sentiment === "Neutral") {
  //       results.push(item.sentiment > 0.4 && item.sentiment < 0.8);
  //     } else if (sentiment === "Positive") {
  //       results.push(item.sentiment >= 0.8);
  //     } else if (sentiment === "Negative") {
  //       results.push(item.sentiment <= 0.4);
  //     }
  //   });
  //   return results.some((result) => result);
  // });

  // const sortedComments = filteredComments.sort((a, b) => {
  //   if (sortBy === "asc") {
  //     return a.sentiment - b.sentiment;
  //   } else if (sortBy === "desc") {
  //     return b.sentiment - a.sentiment;
  //   } else {
  //     return 0; // no sorting
  //   }
  // });

  const sortDate = () => {
    handleSort("created_utc", dateArrow);
    setDateArrow(dateArrow === "asc" ? "desc" : "asc");
  };
  const sortSentiment = () => {
    // handleSort("created_utc", dateArrow);
    setSentimentArrow(sentimentArrow === "asc" ? "desc" : "asc");
  };
  const handleSort = (field, sortBy) => {
    const solrUrl = `http://localhost:9893/solr/new_core/select?q=book:${id}&q.op=OR&fq=TYPE:COMMENT&sort=${field}%20${sortBy}&indent=true&rows=10000`;
    getData(solrUrl);
  };

  const getData = async (solrUrl) => {
    const res = await axios.get(solrUrl);
    const documents = res.data.response.docs;
    console.log(documents);
    setSolrComments(documents);
  };
  useEffect(() => {
    const solrUrl = `http://localhost:9893/solr/new_core/select?q=book:${id}&q.op=OR&fq=TYPE:COMMENT&indent=true&rows=10000`;
    getData(solrUrl);

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
      <h1 className="bookTitle">{id}</h1>
      <div className="bookInfo">
        <div className="image">IMAGE</div>
        <div className="details">
          <p>Description: </p>
          <p>Total Comments: {solrComments.length}</p>
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
                className="ecl"
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
                className="ecl"
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

      {/* table */}
      <table className="bookTable">
        <thead>
          <tr>
            <th className="comment">Comment</th>
            <th className="date">
              <span>Date</span>
              <button className="sortArrow" onClick={sortDate}>
                {dateArrow === "asc" ? "▲" : "▼"}
              </button>
            </th>
            <th className="sentiment">
              <span>Sentiment </span>
              <button className="sortArrow" onClick={sortSentiment}>
                {sentimentArrow === "asc" ? "▲" : "▼"}
              </button>
              <span>
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
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((item, index) => (
            <tr key={index}>
              {/* Table cells */}
              <td className="comment">{item.comment_text}</td>
              <td className="date">{item.created_utc.split("T")[0]}</td>
              <td className="sentiment">{item.post_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Showing results {indexOfFirstRow} to {indexOfLastRow}
      </p>
    </div>
  );
};

export default Book;

// return (
//   <div className="bookPage">
//     <button className="backBtn" onClick={goBack}>
//       back
//     </button>
//     <h1 className="bookTitle">{bookInfo.title}</h1>
//     <div className="bookInfo">
//       <div className="image">IMAGE</div>
//       <div className="details">
//         <p>Description: </p>
//         <p>Genre: {bookInfo.genre}</p>
//         <p>Total Comments: {sentimentInfo.length}</p>
//         <p>
//           Average Sentiment:{" "}
//           <span style={sentimentDescStyle(sentimentInfo.average)}>
//             {sentimentInfo.average}
//           </span>
//         </p>
//       </div>
//     </div>
//     <table className="bookTable">
//       <thead>
//         <tr>
//           <th className="comment">Comment</th>
//           <th className="sentiment sentHead">
//             <p>Sentiment </p>
//             <button className="sortArrow" onClick={handleSort}>
//               {sortBy === "asc" ? "▲" : "▼"}
//             </button>
//             <div>
//               <img
//                 src={filterIcon}
//                 alt="filterIcon"
//                 width="16"
//                 height="16"
//                 className="sentimentDropdown"
//                 onMouseEnter={toggleDropdown}
//               />

//               {isOpen && (
//                 <div
//                   className="sentimentCheckbox"
//                   onMouseLeave={toggleDropdown}
//                 >
//                   {sentimentList.map((sentiment) => (
//                     <div className="sentimentSelect">
//                       <input
//                         type="checkbox"
//                         name="sentiment"
//                         id={sentiment}
//                         value={sentiment}
//                         checked={selectedSentiments.includes(sentiment)}
//                         onChange={() => handleFilter(sentiment)}
//                       />
//                       <label
//                         for={sentiment}
//                         style={sentimentCheckboxStyle(sentiment)}
//                       >
//                         {sentiment}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </th>
//         </tr>
//       </thead>
//       <tbody>
//         {sortedComments.map((item, index) => (
//           <tr key={index}>
//             <td className="comment">{item.comment}</td>
//             <td
//               className="sentiment"
//               style={sentimentTableStyle(item.sentiment)}
//             >
//               {item.sentiment}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );
