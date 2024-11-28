import React from "react";
import "./App.scss";
import { createRoot } from "react-dom/client";
import { CheckoutContainer } from "./CheckoutContainer";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <div className="container">
      <CheckoutContainer
        cartId="cart_2282210204_W_USA_USA_ENG"
        shopperId="WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"
      />
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
