import React from "react";
import { createRoot } from "react-dom/client";
import "./App.scss";
import CheckoutContainer from "./checkout/CheckoutContainer";
import { Provider, useAtom } from "jotai";
import { loadingAtom, OrderStore } from "./store";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [loading] = useAtom(loadingAtom);

  return (
    <div className="container">
      <Provider store={OrderStore}>
        {/* for new customer  */}
        <CheckoutContainer
          cartId="cart_1649749863_W_USA_USA_ENG"
          shopperId="YxpkWzXkzUqYezheXYzqwwjzUjkjXYwpjVzxzekeww"
          pcid="1649749863"
          siteId="222"
          sessionId="3006662852"
        />

        {/* <CheckoutContainer
          cartId="cart_1577135711_W_USA_USA_ENG"
          shopperId="VZVmeXhZzYUYmzhheYzqWjzzwjqmZYpUZqxVzxehj"
          pcid="1577135711"
          siteId="222"
        /> */}

        {/* for old custoemr  */}
        {/* <CheckoutContainer
          cartId="cart_1090703739_W_USA_USA_ENG"
          shopperId="ZVkVwkWkzpqXmzheqezpXYxzkzZYkeeZUZVqzxpqkk"
          pcid="1090703739"
          siteId="66"
        /> */}

        {/* for old custoemr  */}
        {/* <CheckoutContainer
          cartId="cart_2282210204_W_USA_USA_ENG"
          shopperId="WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"
          pcid="2282210204"
          siteId="260"
          sessionId=""
        /> */}
        {/* for vikas card custoemr  */}
        {/* <CheckoutContainer
          cartId="cart_1343617963_W_USA_USA_ENG"
          shopperId="xqkpqWUUzhwpxzhxYzzpZYkzmqqXhhZpwzxVzxpx"
          pcid="1343617963"
          siteId="222"
          sessionId="3006662207"
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
