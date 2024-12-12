import React from "react";
import { createRoot } from "react-dom/client";
import Checkout from "./CheckoutContainerWrapper";

// Registers component as a custom element
class CheckoutElement extends HTMLElement {
  constructor() {
    super();
    this.root = null;
    this.mountPoint = null;
  }

  connectedCallback() {
    this.mountPoint = document.createElement("div");
    this.appendChild(this.mountPoint);

    const cartId = this.getAttribute("cartId");
    const shopperId = this.getAttribute("shopperId");
    const props = { cartId, shopperId };

    this.root = createRoot(this.mountPoint);
    this.root.render(React.createElement(Checkout, props));
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

export default CheckoutElement;
