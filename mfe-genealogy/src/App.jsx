import { createRoot } from "react-dom/client";
import Genealogy from "./Genealogy";

const App = () => (
  <Genealogy />
);
createRoot(document.getElementById("app")).render(<App />);
