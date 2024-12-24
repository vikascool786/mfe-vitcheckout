import React from "react";
import { createRoot } from "react-dom/client";
import CheckoutContainerWrapper from "./CheckoutContainerWrapper";

// Registers component as a custom element
class CheckoutContainerElement extends HTMLElement {
  constructor() {
    super();
    this.root = null;
    this.mountPoint = null;
  }

  connectedCallback() {
    this.mountPoint = document.createElement("div");
    this.appendChild(this.mountPoint);

    const props = {
      shopperId: this.getAttribute("shopperid") || "",
      cartId: this.getAttribute("cartid") || "",
      pcid: this.getAttribute("pcid") || "",
      siteId: this.getAttribute("siteid") || "",
    };

    this.root = createRoot(this.mountPoint);
    this.root.render(React.createElement(CheckoutContainerWrapper, props));
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

export default CheckoutContainerElement;
