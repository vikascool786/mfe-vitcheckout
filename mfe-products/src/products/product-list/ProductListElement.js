import React from "react";
import { createRoot } from "react-dom/client";
import ProductList from "./ProductList";

class ProductListElement extends HTMLElement {
  constructor() {
    super();
    this.root = null;
    this.mountPool = null;
  }

  connectedCallback() {
    this.mountPoint = document.createElement("div");
    this.appendChild(this.mountPoint);

    this.root = createRoot(this.mountPoint);
    this.root.render(React.createElement(ProductList));
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}
export default ProductListElement;
