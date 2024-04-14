import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QueryResults = (props) => {
  const navigate = useNavigate();

  const sentimentDescStyle = (sentiment) => {
    if (sentiment >= 0.8) {
      return { color: "rgb(117,145,22)" };
    } else if (sentiment <= 0.4) {
      return { color: "rgb(191,16,41)" };
    } else {
      return { color: "rgb(255,178,52)" };
    }
  };

  const viewResult = (id) => {
    console.log(id);
    navigate(`/book/${id}`);
  };

  return (
    <div className="resultSection">
      {props.results.length > 0 && (
        <p className="resultsCount">
          About {props.results.length} results ({props.speed} ms)
        </p>
      )}
      <div className="resultsDiv">
        {props.results.map((result) => (
          <div className="resultcard" onClick={() => viewResult(result.book)}>
            {/* <div className="imagecard">image</div> */}
            <img
              src={result.cover_path}
              alt="Book Image"
              className="imagecard"
            />
            <div className="detailscard">
              <p className="titlecard">{result.book}</p>
              <p className="othercard">Genre: {result.category}</p>
              <p className="othercard">Author: {result.book_author}</p>
              <p className="othercard">
                Publication Date: {result.publication_date.split("T")[0]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryResults;
