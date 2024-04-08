import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import data from "../data.json";
import ResultsSection from "./ResultsSection";

/*

  %20 represents space

  q: query
  q=title:Harry%20Potter

  fq: filtering
  fq=genre:Fantasy
  fq=year:[2006 TO 2023]
  
  start=0&rows=10 -> first 10 results
  
  eg. query: "Harry Potter", filter by genre & year
  http://localhost:8983/solr/<collection>/select?q=title:Harry%20Potter&fq=genre:Fantasy&fq=year:[2006 TO 2023]&start=0&rows=10

*/

/* SAMPLE OUTPUT:
    {
    "responseHeader": {
      "status": 0,
      "QTime": 10,
      "params": {
        "q": "title:Harry Potter",
        "fq": "genre:Fantasy",
        "sort": "score desc",
        "start": "0",
        "rows": "10"
      }
    },
    "response": {
      "numFound": 100,
      "start": 0,
      "docs": [
        {
          "id": "1",
          "title": "Harry Potter and the Sorcerer's Stone",
          "genre": "Fantasy",
          "publication_date": "2003-06-21",
          "avg_sentiment_score": 0.95,
          "comments": [
            { "comment": "Intense read!", "sentiment": 0.8 },
            { "comment": "Emotional rollercoaster", "sentiment": 0.7 },
            { "comment": "Jaw-dropping twists", "sentiment": 0.85 },
            ...
          ]
        },
        {
          "id": "2",
          "title": "Harry Potter and the Chamber of Secrets",
          // Additional fields...
        },
        // More documents...
      ]
    }
  }

  results.data.response.docs -> extracts that array of info [{},{},..]
  reference data.json for reference
  */

const MainPage = () => {
  const location = useLocation();

  const genreList = ["Fantasy", "Romance", "Non-Fiction", "Horror"];
  // assume min and max year can be retrieved
  const minYear = 1990;
  const maxYear = 2022;
  const [selectedMinYear, setSelectedMinYear] = useState(minYear);
  const [selectedMaxYear, setSelectedMaxYear] = useState(maxYear);

  const [searchInput, setSearchInput] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [results, setResults] = useState([]);

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

    console.log("------ solr prep section ------");
    const updatedInput = input.toLowerCase().replaceAll(" ", "%20");
    console.log(`q=title:${updatedInput}`);
    genres.map((genre) => {
      console.log(`fq=genre:${genre}`);
    });
    console.log(`fq=year:[${minYear} TO ${maxYear}]`);

    // // construct Solr query URL
    // const solrUrl =
    //   "http://localhost:8983/solr/<collection>/select?q=title:Harry%20Potter&fq=genre:Fantasy&fq=year:[2006 TO 2023]&start=0&rows=10";
    // // note: need to split the spaces and replace with "%20"

    // // send GET request to Solr
    // const results = await axios.get(solrUrl);

    // // update state with search results
    // console.log(results.data.response.docs);
  };

  return (
    <div className="mainPage">
      <div className="searchSection">
        <input
          className="searchbar"
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

      <ResultsSection results={results} />
    </div>
  );
};

export default MainPage;
