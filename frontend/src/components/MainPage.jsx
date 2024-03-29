import { useState } from "react";

import data from "../data.json";
import ResultsSection from "./ResultsSection";

const MainPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  const search = () => {
    console.log(searchInput);
    const results = data.filter((item) =>
      item.title.toLowerCase().match(searchInput.toLowerCase())
    );
    setResults(results);
  };

  return (
    <div className="mainPage">
      <div className="searchSection">
        <input
          className="searchbar"
          type="text"
          placeholder="Search for a book"
          onChange={handleChange}
          value={searchInput}
        />
        <button onClick={search}>Search</button>
      </div>

      <ResultsSection results={results} />
    </div>
  );
};

export default MainPage;
