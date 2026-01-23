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
          cartId="cart_1918885741_W_USA_USA_ENG"
          shopperId="YUXUeYeqzeYzUzhkYVzZhUezzwUwUmqUpVmYzjqzz"
          pcid="1918885741"
          siteId="66"
          sessionId="3055675987"
          portalId="3309812.COM"
          isGuest={false}
        /> */}

        {/* for old custoemr  */}
        {/* <CheckoutContainer
          cartId="cart_68a9bcc6-118c-45ea-a617-cd6111ec0cfa_W_USA_USA_ENG"
          shopperId=""
          pcid=""
          siteId="66"
          sessionId="3055643969"
          portalId="7052764.COM"
          isGuest={true}
        /> */}
          {/* Guest shopper  */}
          {/* <CheckoutContainer
              cartId="cart_9ad9bbc6-49fb-4763-a20e-a16c859cad16_W_USA_USA_ENG"
              shopperId=""
              pcid=""
              siteId="222"
              sessionId="3006907869"
              portalId="SHOPMARKET.COM"
              isGuest={true}
          /> */}

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
        {/* click to pay dev  */}
        {/* <CheckoutContainer
          cartId="cart_1241682018_W_USA_USA_ENG"
          shopperId="qYZjYmVWzVzUWzhmjYzpVZZzxUwYhxzzjUUZzxzewh"
          pcid="1241682018"
          siteId="222"
          sessionId="3006951063"
          portalId="PREFERREDPRICES.COM"
          isGuest={false}
        /> */}
        {/* click to pay dev  */}
        <CheckoutContainer
          cartId="cart_c22f9eaa-229a-46f9-aad4-3042be6d6ddc_W_USA_USA_ENG"
          shopperId="XWjVVhUZzzjxjzhhVwzYjYUzeWUkzUVkzjmUzemejh"
          pcid="1646548472"
          siteId="222"
          sessionId="3007019014"
          portalId="TEST.COM"
          isGuest={true}
        />
        {/* click to pay stage  */}
        {/* <CheckoutContainer
          cartId="cart_1341756568_W_USA_USA_ENG"
          shopperId="kqYekXWVzzejYzhqzmzYhwWzhexqVxqkzVWezwzzjm"
          pcid="1341756568"
          siteId="66"
          sessionId="3055819493"
          portalId="SHOPMARKET.COM"
          isGuest={false}
        /> */}
      </Provider>
    </div>
  );
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
