import { createRoot } from "react-dom/client";

import Genealogy from "./Genealogy";

import "./App.scss";

const App = () => (
  <div className="container">
    <div>mfe-genealogy</div>
    <Genealogy />
  </div>
);
createRoot(document.getElementById("app")).render(<App />);
