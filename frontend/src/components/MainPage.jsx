import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import data from "../data.json";
import ResultsSection from "./ResultsSection";

const MainPage = () => {
  const location = useLocation();

  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const title = params.get("title");
    setSearchInput(title);
    getResults(title);
  }, []);

  const search = () => {
    const params = new URLSearchParams(location.search);
    params.set("title", searchInput);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
    getResults(searchInput);
  };

  const getResults = (input) => {
    if (!input || input.length == 0) {
      setResults([]);
      return;
    }

    const results = data.filter((item) =>
      item.title.toLowerCase().match(`\\b${input.toLowerCase()}`)
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
        <div className="filterSection">FILTER SECTION</div>
        <button onClick={search}>Search</button>
      </div>

      <ResultsSection results={results} />
    </div>
  );
};

export default MainPage;
