import React from "react";
import { createRoot } from "react-dom/client";
import { Skeleton } from "./component";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <div className="search-app__container">
      <Skeleton />
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
