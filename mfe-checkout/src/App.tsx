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
        {/* <CheckoutContainer
          cartId="cart_1762863970_W_USA_USA_ENG"
          shopperId="qYmmqpWZzVjeZzhZqpzpVYwzkmqWjqkhZVqjzxqjqp"
          pcid="1459068382"
          siteId="66"
          sessionId="3055290977"
        /> */}

        {/* for old custoemr  */}
        <CheckoutContainer
          cartId="cart_2637612996_W_USA_USA_ENG"
          shopperId="UmkepZWVzmqqVzhVqkzZmwqzWeXVYVWXWZZpzxhemz"
          pcid="2637612996"
          siteId="222"
          sessionId="3006681902"
        />

        {/* vift cashback account  */}
        {/* <CheckoutContainer
          cartId="cart_1316760835_W_USA_USA_ENG"
          shopperId="mkYxXjppzhzmjzhxWzzpkYjzmYXZVzYWkeZjzwjhx"
          pcid="1316760835"
          siteId="66"
          sessionId="3055307133"
        /> */}

        {/* expired credit card account  */}
        {/* <CheckoutContainer
          cartId="cart_1947765337_W_USA_USA_ENG"
          shopperId="hmUhkqpzzezhXzhhVqzZmxWzqeYXkUjzqXjpzpqqm"
          pcid="1947765337"
          siteId="66"
          sessionId="3055311904"
        /> */}

        {/* for GC Card Customer */}
        {/* <CheckoutContainer
          cartId="cart_1778511302_W_USA_USA_ENG"
          shopperId="zWUVXxqjzwWqWzhZjqzZYUWzwWxWzhUmwVwUzehzpp"
          pcid="1778511302"
          siteId="66"
          sessionId="3055249126"
        /> */}
        {/* <CheckoutContainer
          cartId="cart_1762863970_W_USA_USA_ENG"
          shopperId="qYmmqpWZzVjeZzhZqpzpVYwzkmqWjqkhZVqjzxqjqp"
          pcid="1762863970"
          siteId="66"
          sessionId="3055290977"
        /> */}
        {/* for vikas card custoemr  */}
        {/* <CheckoutContainer
          cartId="cart_1817046463_W_USA_USA_ENG"
          shopperId="mXeWpzjqzWkwhzhqzYzZWwwzZXjzpwhUpXqqzjjx"
          pcid="1817046463"
          siteId="66"
          sessionId="3055249126"
        /> */}
        {/* <CheckoutContainer
          cartId="cart_1326748654_W_USA_USA_ENG"
          shopperId="hqwxZzYzzqpeVzhWmZzZmZpzzkxkjzmZWqqWzxzkzj"
          pcid="1326748654"
          siteId="222"
          sessionId="3055249126"
        /> */}
      </Provider>
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
