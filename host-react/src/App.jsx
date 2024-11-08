import { createRoot } from "react-dom/client";

//import Counter from "mfeCounter/Counter";
import ProductList from "mfeProducts/ProductList";
import Product from "mfeProducts/Product";

import "./index.scss";

const App = () => (
  <div className="container">
    <div>HOST</div>
    {/* <Counter name="Host app" description="Sample description" /> */}
    ProductList:
    <ProductList />
    Product:
    {/* <Product /> */}
  </div>
);
createRoot(document.getElementById("app")).render(<App />);
