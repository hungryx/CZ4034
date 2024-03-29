import { useState } from "react";
import SearchBar from "./components/SearchBar";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      APP NAME
      <SearchBar />
    </>
  );
}

export default App;
