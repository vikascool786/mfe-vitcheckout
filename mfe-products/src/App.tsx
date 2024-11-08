import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.scss";
import ProductList from "./products/product-list/ProductList";
import ProductStoreList from "./product-stores/product-store-list/ProductStoreList";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <div style={{ padding: "0 10px" }}>
      <>Product List</>
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
