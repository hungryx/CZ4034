import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResultsSection = (props) => {
  const navigate = useNavigate();

  const viewResult = (id) => {
    console.log(id);
    navigate(`/book/${id}`);
  };
  return (
    <div className="resultSection">
      {props.results.length > 0 && (
        <p className="resultsCount">
          Displaying {props.results.length} results
        </p>
      )}
      <div className="resultsDiv">
        {props.results.map((result) => (
          <div className="resultcard" onClick={() => viewResult(result.id)}>
            <p>title: {result.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsSection;
