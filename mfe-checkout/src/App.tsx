import React from "react";
import "./App.scss"
import { createRoot } from "react-dom/client";
import { Checkout } from "./Checkout";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <div className="container">
      <Checkout />
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
