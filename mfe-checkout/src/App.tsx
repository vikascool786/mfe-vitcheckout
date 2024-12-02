import React from "react";
import { createRoot } from "react-dom/client";
import "./App.scss";
import { CheckoutContainer } from "./CheckoutContainer";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <div className="container">
      <CheckoutContainer
        cartId="cart_1182228987_W_USA_USA_ENG"
        shopperId="WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"
      />
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
