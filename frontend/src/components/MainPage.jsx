import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import data from "../data.json";
import ResultsSection from "./ResultsSection";
import QueryResults from "./QueryResults";

const MainPage = () => {
  const location = useLocation();

  const genreList = ["Fantasy", "Mystery", "Action", "Comedy", "Horror"];

  // assume min and max year can be retrieved
  const minYear = 1990;
  const maxYear = 2022;
  const [selectedMinYear, setSelectedMinYear] = useState(minYear);
  const [selectedMaxYear, setSelectedMaxYear] = useState(maxYear);

  const [searchInput, setSearchInput] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);

  const [results, setResults] = useState([]);
  const [solrResults, setSolrResults] = useState([]);
  const [books, setBooks] = useState([]);

  const [querySpeed, setQuerySpeed] = useState(0);

  // handling changes to input
  const handleText = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };
  const handleCheckBox = (genre) => {
    const isGenreSelected = selectedGenres.includes(genre);

    if (isGenreSelected) {
      const updatedGenres = selectedGenres.filter(
        (selectedGenre) => selectedGenre !== genre
      );
      setSelectedGenres(updatedGenres);
    } else {
      const updatedGenres = [...selectedGenres, genre];
      setSelectedGenres(updatedGenres);
    }
  };
  const handleStartDate = (e) => {
    e.preventDefault();
    setSelectedMinYear(e.target.value);
  };
  const handleEndDate = (e) => {
    e.preventDefault();
    setSelectedMaxYear(e.target.value);
  };

  // for loading the page based on search params
  // (when returning from book page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.size === 0) {
      return;
    }
    const title = params.get("title");
    const genres = params.get("genres").split(",");
    const minYear = params.get("minYear");
    const maxYear = params.get("maxYear");
    setSearchInput(title);
    setSelectedGenres(genres);
    setSelectedMinYear(minYear);
    setSelectedMaxYear(maxYear);
    getResults(title, genres, minYear, maxYear);
  }, []);

  // useEffect(() => {
  //   search();
  // }, [searchInput, selectedGenres, selectedMinYear, selectedMaxYear]);

  // search and display functions
  const search = () => {
    const params = new URLSearchParams(location.search);
    params.set("title", searchInput);
    params.set("genres", selectedGenres);
    params.set("minYear", selectedMinYear);
    params.set("maxYear", selectedMaxYear);

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
    getResults(searchInput, selectedGenres, selectedMinYear, selectedMaxYear);
  };

  const getData = async (input) => {
    const words = input.split(" ");
    const formattedWords = words.map(
      (word) =>
        `*${encodeURIComponent(
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )}*`
    );
    const literal = formattedWords.join("%20AND%20");

    // construct Solr query URL
    // const solrUrl = `http://localhost:9893/solr/new_core/select?q=book:%22${input}%22&q.op=OR&fq=TYPE:COMMENT&indent=true&rows=50`;

    const solrUrl = `http://localhost:9893/solr/new_core/select?q=book:(${literal})&q.op=OR&fq=TYPE:COMMENT&indent=true&rows=10000`;

    // console.log(solrUrl);

    const res = await axios.get(solrUrl);
    const documents = res.data.response.docs;
    setSolrResults(documents);
    // console.log(documents);

    const uniqueBooks = new Set(documents.map((obj) => obj.book));
    const distinctBooks = Array.from(uniqueBooks);
    setBooks(distinctBooks);
    console.log(distinctBooks);
  };

  const getResults = (input, genres, minYear, maxYear) => {
    // WILL BE REPLACED BY API CALL TO SOLR (rmb add async above)

    // if (!input || input.length == 0) {
    //   setResults([]);
    //   return;
    // }

    const startTime = performance.now();

    const results = data.filter((item) =>
      item.title.toLowerCase().match(`\\b${input.toLowerCase()}`)
    );
    setResults(results);

    // console.log("------ solr prep section ------");
    // // note: need to split the spaces and replace with "%20"
    const updatedInput = input.replaceAll(" ", "%20");
    // console.log(`q=title:${updatedInput}`);
    // genres.map((genre) => {
    //   console.log(`fq=genre:${genre}`);
    // });
    // console.log(`fq=year:[${minYear} TO ${maxYear}]`);

    getData(input);
    // console.log(solrResults);

    const endTime = performance.now();
    const speed = endTime - startTime; // query speed in milliseconds
    setQuerySpeed(speed);
  };

  return (
    <div className="mainPage">
      <div className="searchSection">
        <input
          className="searchbar"
          id="searchbar"
          type="text"
          placeholder="Search for a book"
          onChange={handleText}
          value={searchInput}
        />
        <div className="filterSection">
          <div className="genreSelection">
            <p>Genre:</p>
            <div className="allGenres">
              {genreList.map((genre) => (
                <>
                  <input
                    type="checkbox"
                    name="genre"
                    id={genre}
                    value={genre}
                    checked={selectedGenres.includes(genre)}
                    onChange={() => handleCheckBox(genre)}
                  />
                  <label for={genre}>{genre}</label>
                </>
              ))}
            </div>
          </div>
          <div className="dateSelection">
            <p>Year Range of Publication:</p>
            <div className="allDates">
              <select
                name="startYear"
                id="startYear"
                onChange={handleStartDate}
                value={selectedMinYear}
              >
                {[...Array(maxYear - minYear).keys()].map((year) => (
                  <option value={minYear + (year + 1)}>
                    {minYear + (year + 1)}
                  </option>
                ))}
              </select>
              <p>to</p>
              <select
                name="endYear"
                id="endYear"
                onChange={handleEndDate}
                value={selectedMaxYear}
              >
                {[...Array(maxYear - selectedMinYear).keys()].map((year) => (
                  <option value={maxYear - year}>{maxYear - year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button onClick={search}>Search</button>
      </div>

      <QueryResults results={books} speed={querySpeed} />
      {/* <ResultsSection results={results} speed={querySpeed} /> */}
    </div>
  );
};

export default MainPage;
