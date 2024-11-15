import React from "react";
import { createRoot } from "react-dom/client";

import SearchResultWrapper from "./search-result-container/SearchResultWrapper";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <div className="search-app__container">
      <SearchResultWrapper
        countryCode="USA"
        languageCode="ENG"
        siteType="SHP"
        pcId=""
        portalId=""
      />
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
