import React from "react";
import { createRoot } from "react-dom/client";
import "./App.scss";
import CheckoutContainer from "./checkout/CheckoutContainer";
import { Provider, useAtom } from "jotai";
import { loadingAtom, OrderStore } from "./store";

interface AppProps { }

const App: React.FC<AppProps> = () => {
  const [loading] = useAtom(loadingAtom);

  return (
    <div className="container">
      <Provider store={OrderStore}>
        {/* for new customer  */}
        {/* <CheckoutContainer
          cartId="cart_1228818805_W_USA_USA_ENG"
          shopperId="qejxxxVmzkzqxzhxkYzpzUWzhxmmkWzWUjhXzmqmm"
          pcid="1228818805"
          siteId="222"
        /> */}

        {/* <CheckoutContainer
          cartId="cart_1577135711_W_USA_USA_ENG"
          shopperId="VZVmeXhZzYUYmzhheYzqWjzzwjqmZYpUZqxVzxehj"
          pcid="1577135711"
          siteId="222"
        /> */}

        {/* for old custoemr  */}
        <CheckoutContainer
          cartId="cart_1000177758_W_USA_USA_ENG"
          shopperId="YzZVqjzqzqmhezhxkwzZheWzXeVpWVzkVVXwzxwwmp"
          pcid="1000177758"
          siteId="66"
        />

        {/* for old custoemr  */}
        {/* <CheckoutContainer
          cartId="cart_2282210204_W_USA_USA_ENG"
          shopperId="WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"
          pcid="2282210204"
          siteId="260"
        /> */}
        {/* for sahil card custoemr  */}
        {/* <CheckoutContainer
          cartId="cart_1861400426_W_USA_USA_ENG"
          shopperId="UkkUxVXWzmVzYzhxUhzZzXezkhqpwxUkwqUezxxkqk"
          pcid="1861400426"
          siteId="66"
        /> */}

        {/* <CheckoutContainer
          cartId="cart_1326748654_W_USA_USA_ENG"
          shopperId="hqwxZzYzzqpeVzhWmZzZmZpzzkxkjzmZWqqWzxzkzj"
          pcid="1326748654"
          siteId="222"
        /> */}
      </Provider>
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
