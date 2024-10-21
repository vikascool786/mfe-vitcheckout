import { createRoot } from "react-dom/client";
import SearchFilter from "./SearchFilter";
import "./App.scss";

const App = () => (
  <div className="container">
    <SearchFilter />
  </div>
);
createRoot(document.getElementById("app")).render(<App />);
