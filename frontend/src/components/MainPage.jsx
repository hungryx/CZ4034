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

  const test = async (input) => {
    console.log("here");
    // construct Solr query URL
    const solrUrl = `http://localhost:9893/solr/new_core/select?indent=true&rows=25&q.op=OR&q=title:${input}&useParams=`;

    const riri = await axios.get(solrUrl);
    console.log(riri.data.response);
    setSolrResults(riri.data.response.docs);
  };

  const getResults = (input, genres, minYear, maxYear) => {
    // WILL BE REPLACED BY API CALL TO SOLR (rmb add async above)

    // if (!input || input.length == 0) {
    //   setResults([]);
    //   return;
    // }

    const results = data.filter((item) =>
      item.title.toLowerCase().match(`\\b${input.toLowerCase()}`)
    );
    setResults(results);

    // console.log("------ solr prep section ------");
    // // note: need to split the spaces and replace with "%20"
    // const updatedInput = input.toLowerCase().replaceAll(" ", "%20");
    // console.log(`q=title:${updatedInput}`);
    // genres.map((genre) => {
    //   console.log(`fq=genre:${genre}`);
    // });
    // console.log(`fq=year:[${minYear} TO ${maxYear}]`);

    test(input);
    console.log(solrResults);
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

      <QueryResults results={solrResults} />
      {/* <ResultsSection results={results} /> */}
    </div>
  );
};

export default MainPage;
