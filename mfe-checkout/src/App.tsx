import React from "react";
import { createRoot } from "react-dom/client";
import "./App.scss";
import CheckoutContainerWrapper from "./CheckoutContainerWrapper";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <CheckoutContainerWrapper
      cartId="cart_2282210204_W_USA_USA_ENG"
      shopperId="WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"
    />
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
