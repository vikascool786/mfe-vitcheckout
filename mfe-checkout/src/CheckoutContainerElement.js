import React from 'react';
import { createRoot } from 'react-dom/client';
// import CheckoutContainer from './CheckoutContainer';
import { CheckoutContainer } from "./pages/checkout/CheckoutContainer";

// Registers component as a custom element
class CheckoutContainerElement extends HTMLElement {
    constructor() {
        super();
        this.root = null;
        this.mountPoint = null;
    }

    connectedCallback() {
        this.mountPoint = document.createElement('div');
        this.appendChild(this.mountPoint);
    
        const props = {
          shopperId: this.getAttribute("shopperid") || "",
          cartId: this.getAttribute("cartid") || "",
        };
    
        this.root = createRoot(this.mountPoint);
        this.root.render(React.createElement(CheckoutContainer, props));
    }

    disconnectedCallback() {
        if (this.root) {
            this.root.unmount();
        }
    }
}

export default CheckoutContainerElement;