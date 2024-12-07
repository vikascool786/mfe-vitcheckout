import React from "react";
import { createRoot } from "react-dom/client";
import "./App.scss";
import { CheckoutContainer } from "./CheckoutContainer";
import { Provider } from "jotai";
import { OrderStore } from "./store";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <div className="container">
      <Provider store={OrderStore}>
        <CheckoutContainer
          cartId="cart_1182228987_W_USA_USA_ENG"
          shopperId="WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"
        />
      </Provider>
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
