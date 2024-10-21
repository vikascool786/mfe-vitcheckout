import React from "react";
import { createRoot } from "react-dom/client";
import SearchResultWrapper from "./SearchResultWrapper";

class SearchContainerElement extends HTMLElement {
  constructor() {
    super();
    this.root = null;
    this.mountPool = null;
  }

  connectedCallback() {
    this.mountPoint = document.createElement("div");
    this.appendChild(this.mountPoint);

    const props = {
      pcId: this.getAttribute("pcid") || "",
      countryCode: this.getAttribute("countrycode") || "",
      languageCode: this.getAttribute("languagecode") || "",
      siteType: this.getAttribute("sitetype") || "",
      portalId: this.getAttribute("portalid") || "",
    };

    this.root = createRoot(this.mountPoint);
    this.root.render(React.createElement(SearchResultWrapper, props));
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}
export default SearchContainerElement;
