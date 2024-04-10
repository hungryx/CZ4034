import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    // navigate(`/book/${id}`);
    console.log(id);
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
          <div className="resultcard" onClick={() => viewResult(result)}>
            <div className="imagecard">image</div>
            <div className="detailscard">
              <p className="titlecard">{result}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryResults;
