import React from 'react';
import { createRoot } from 'react-dom/client';
import Genealogy from './Genealogy';

// Registers component as a custom element
class GenealogyElement extends HTMLElement {
    constructor() {
        super();
        this.root = null;
        this.mountPoint = null;
    }

    connectedCallback() {
        this.mountPoint = document.createElement('div');
        this.appendChild(this.mountPoint);

        const name = this.getAttribute('name');
        const description = this.getAttribute('description');
        const property = this.getAttribute('property');
        const props = { name, description, property };

        this.root = createRoot(this.mountPoint);
        this.root.render(React.createElement(Genealogy, props));
    }

    disconnectedCallback() {
        if (this.root) {
            this.root.unmount();
        }
    }
}

export default GenealogyElement;