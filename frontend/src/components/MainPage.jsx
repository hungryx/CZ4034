import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import data from "../data.json";
import ResultsSection from "./ResultsSection";
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
  const minYear = 1990;
  const maxYear = 2022;
  const [selectedMinYear, setSelectedMinYear] = useState(minYear);
  const [selectedMaxYear, setSelectedMaxYear] = useState(maxYear);

  const [searchInput, setSearchInput] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);

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

  const test = async () => {
    // const solrUrl =
    //   "http://localhost:8983/solr/new_core/select?fq=TYPE%3ACOMMENT&indent=true&q.op=OR&q=category%3ARomance&useParams=&stats=true&stats.field=book";
    const solrUrl =
      "http://localhost:8983/solr/new_core/select?q=*:*&facet=true&facet.field=book";

    const res = await axios.get(solrUrl);
    const documents = res.data.response.docs;
    // console.log(res.data.stats.stats_fields);
    console.log(res.data.facet_counts.facet_fields);

    // const uniqueBooks = new Set(documents.map((obj) => obj.book));
    // const distinctBooks = Array.from(uniqueBooks);
    // setBooks(distinctBooks);
    // console.log(distinctBooks);
  };

  // for loading the page based on search params
  // (when returning from book page)
  useEffect(() => {
    // testing area
    //
    //
    // test();
    //
    //
    const params = new URLSearchParams(location.search);
    if (params.size === 0) {
      return;
    }
    const title = params.get("title");
    const genres = params.get("genres").split(",");
    // const minYear = params.get("minYear");
    // const maxYear = params.get("maxYear");
    setSearchInput(title);
    setSelectedGenres(genres);
    // setSelectedMinYear(minYear);
    // setSelectedMaxYear(maxYear);
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

    // params.set("minYear", selectedMinYear);
    // params.set("maxYear", selectedMaxYear);

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
    getResults(searchInput, targetGenres, selectedMinYear, selectedMaxYear);
  };

  const getData = async (title, genres) => {
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

    // construct Solr query URL
    const solrUrl = `http://localhost:8983/solr/new_core/select?q=book:(${titleLiteral})&q.op=OR&fq=category:(${categoryLiteral})&fq=TYPE:COMMENT&indent=true&rows=10000`;
    // console.log(solrUrl);

    const res = await axios.get(solrUrl);
    const documents = res.data.response.docs;
    console.log(documents);

    const uniqueBooks = Array.from(
      documents
        .reduce((map, obj) => {
          const key = `${obj.book}-${obj.category}`;
          map.set(key, { title: obj.book, category: obj.category });
          return map;
        }, new Map())
        .values()
    );
    setBooks(uniqueBooks);
    console.log(uniqueBooks);
  };

  const getResults = (title, genres, minYear, maxYear) => {
    // WILL BE REPLACED BY API CALL TO SOLR (rmb add async above)

    // if (!title || title.length == 0) {
    //   setResults([]);
    //   return;
    // }

    const startTime = performance.now();
    getData(title, genres);

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
          {/* <div className="dateSelection">
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
          </div> */}
        </div>
        <button onClick={search}>Search</button>
      </div>

      <QueryResults results={books} speed={querySpeed} />
    </div>
  );
};

export default MainPage;
