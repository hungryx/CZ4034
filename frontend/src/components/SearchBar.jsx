import { useState } from "react";

const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");

  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  // if (searchInput.length > 0) {
  //   // countries.filter((country) => {
  //   //   return country.name.match(searchInput);
  //   // });
  //   console.log(searchInput);
  // }

  const search = () => {
    console.log(searchInput);
  };

  return (
    <div className="searchSection">
      <input
        className="searchbar"
        type="text"
        placeholder="Search for a book"
        onChange={handleChange}
        value={searchInput}
      />
      <button onClick={search}>Search</button>
      <div className="resultsDiv">RESULTS</div>
    </div>
  );
};

export default SearchBar;
