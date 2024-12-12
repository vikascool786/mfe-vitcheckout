import React from "react";
import { createRoot } from "react-dom/client";
import "./App.scss";
import { CheckoutContainer } from "./CheckoutContainer";
import { Provider } from "jotai";
import { OrderStore } from "./store";
import CheckoutContainerWrapper from "./CheckoutContainerWrapper";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return <CheckoutContainerWrapper />;
};
export default App;
createRoot(document.getElementById("app")!).render(<App />);
