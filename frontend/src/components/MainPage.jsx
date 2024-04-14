import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import QueryResults from "./QueryResults";

const MainPage = () => {
  const location = useLocation();

  const genreList = [
    "Action",
    "Comedy",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
  ];

  // assume min and max year can be retrieved
  const [minYear, setMinYear] = useState(0);
  const [maxYear, setMaxYear] = useState(2024);

  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMinYear, setSelectedMinYear] = useState(minYear);
  const [selectedMaxYear, setSelectedMaxYear] = useState(maxYear);

  const [books, setBooks] = useState([]);
  const [querySpeed, setQuerySpeed] = useState(0);

  const [suggestions, setSuggestions] = useState([]);

  // handling changes to input
  const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion);
    setShowDropdown(false);
  };

  const handleText = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
    setShowDropdown(true);

    suggest(toTitleCase(e.target.value));
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

  const suggest = async (title) => {
    const solrUrl = `http://localhost:8983/solr/new_core/suggest?suggest=true&suggest.dictionary=mySuggester&suggest.count=5&suggest.q=${title}`;
    const res = await axios.get(solrUrl);
    const suggestions = Object.values(res.data.suggest.mySuggester)[0]
      .suggestions;

    if (suggestions.length === 0) {
      setShowDropdown(false);
      setSuggestions([]);
      return;
    }
    const terms = suggestions.map((item) => item.term);
    const uniqueTerms = [...new Set(terms)];

    setSuggestions(uniqueTerms);
  };

  const getMinMaxDates = async () => {
    const solrUrl = `http://localhost:8983/solr/new_core/select?q=*:*&q.op=OR&fq=table:books&indent=true&rows=10000&stats=true&stats.field=publication_date`;

    const res = await axios.get(solrUrl);
    const earliest = res.data.stats.stats_fields.publication_date.min;
    const latest = res.data.stats.stats_fields.publication_date.max;

    setMinYear(parseInt(earliest.split("-")[0]));
    setMaxYear(parseInt(latest.split("-")[0]));
    setSelectedMinYear(parseInt(earliest.split("-")[0]));
    setSelectedMaxYear(parseInt(latest.split("-")[0]));
  };

  // for loading the page based on search params (when returning from book page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.size === 0) {
      getMinMaxDates();
      return;
    }
    const title = params.get("title");
    const genres = params.get("genres").split(",");
    const minYear = params.get("minYear");
    const maxYear = params.get("maxYear");

    console.log(minYear);
    setSearchInput(title);
    setSelectedGenres(genres);
    setSelectedMinYear(minYear);
    setSelectedMaxYear(maxYear);
    getResults(title, genres, minYear, maxYear);
  }, []);

  // search and display functions
  const search = () => {
    const params = new URLSearchParams(location.search);
    params.set("title", searchInput);

    let targetGenres;
    if (selectedGenres.length === 0) {
      targetGenres = genreList;
      setSelectedGenres(genreList);
    } else {
      targetGenres = selectedGenres;
    }
    params.set("genres", targetGenres);
    params.set("minYear", selectedMinYear);
    params.set("maxYear", selectedMaxYear);

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
    getResults(searchInput, targetGenres, selectedMinYear, selectedMaxYear);
  };

  const getData = async (title, genres, minYear, maxYear) => {
    // filter by title input
    const words = title.split(" ");
    const formattedWords = words.map(
      (word) =>
        `*${encodeURIComponent(
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )}*`
    );
    const titleLiteral = formattedWords.join("%20AND%20");

    // filter by genre
    const formattedGenres = genres.map((genre) =>
      encodeURIComponent(
        genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase()
      )
    );
    const categoryLiteral = formattedGenres.join("%7C|%7C");

    const solrUrl = `http://localhost:8983/solr/new_core/select?q=book:(${titleLiteral})%0Abook_author:(${titleLiteral})&q.op=OR&fq=category:(${categoryLiteral})&fq=publication_date:%5B${minYear}-01-01T00:00:00Z%20TO%20${maxYear}-12-31T23:59:59Z%5D&fq=table:books&indent=true&rows=10000`;
    // console.log(solrUrl);
    const res = await axios.get(solrUrl);
    const documents = res.data.response.docs;
    console.log(documents);
    setBooks(documents);
  };

  const getResults = (title, genres, minYear, maxYear) => {
    // if (!title || title.length == 0) {
    //   setResults([]);
    //   return;
    // }

    const startTime = performance.now();
    getData(title, genres, minYear, maxYear);

    const endTime = performance.now();
    const speed = endTime - startTime; // query speed in milliseconds
    setQuerySpeed(speed);
  };

  return (
    <div className="mainPage">
      <div className="searchSection">
        <div className="searchbarGroup">
          <input
            className="searchbar"
            id="searchbar"
            type="text"
            placeholder="Search for a book or author"
            onChange={handleText}
            value={searchInput}
            autoComplete="off"
          />
          {showDropdown && (
            <ul className="suggestions" ref={dropdownRef}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="suggestion-item"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

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
    </div>
  );
};

export default MainPage;
