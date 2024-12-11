import { getEndpoints } from "./utilities/mfe-resolver";

window.__webpack_share_scopes__ = window.__webpack_share_scopes__ || {};

//  Pass in true if running MFE builds locally
const remoteEndpoints = getEndpoints();

// Load the remote entry script
const setRemoteScript = (endpoint) => {
  return new Promise((resolve, reject) => {
    const remoteUrlWithVersion = `${endpoint}/remoteEntry.js`;
    const script = document.createElement("script");
    script.src = remoteUrlWithVersion;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load script at ${remoteUrlWithVersion}`));
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  });
};

// Load and instantiate remote module
async function loadRemoteModule(scope, module) {
  const container = window[scope];
  if (!container) {
    throw new Error(`Container ${scope} not found`);
  }

  if (!container.__initialized) {
    container.__initialized = true;
    if (!window.__webpack_share_scopes__.default) {
      window.__webpack_share_scopes__.default = {};
    }
    await container.init(window.__webpack_share_scopes__.default);
  }

  const factory = await container.get(module);
  const Module = factory();
  return Module;
}

// Load and register the web component
async function loadAndRegisterComponent(mfeComponent, endpoint) {
  try {
    await setRemoteScript(endpoint);

    if (!window.React || !window.ReactDOMClient) {
      const React = await loadRemoteModule(`mfe${mfeComponent}`, "./React");
      const ReactDOMClient = await loadRemoteModule(
        `mfe${mfeComponent}`,
        "./ReactDOMClient"
      );

      window.React = React;
      window.ReactDOMClient = ReactDOMClient;
    }

    const Module = await loadRemoteModule(
      `mfe${mfeComponent}`,
      `./${mfeComponent}Element`
    );
    const ElementClass = Module.default;

    if (typeof ElementClass !== "function") {
      throw new Error(`Exported module is not a class: ${mfeComponent}Element`);
    }

    const kebabCaseComponent = mfeComponent
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase();
    customElements.define(`mfe-${kebabCaseComponent}`, ElementClass);
  } catch (error) {
    console.error(`Error loading and registering ${mfeComponent}: ${error}`);
  }
}

// Load mfeStore before components
const loadMfeStore = async () => {
  if (!window.mfeStore) {
    await setRemoteScript(remoteEndpoints.store);
    const container = window.mfeStore;
    if (!container.__initialized) {
      container.__initialized = true;
      if (!window.__webpack_share_scopes__.default) {
        window.__webpack_share_scopes__.default = {};
      }
      await container.init(window.__webpack_share_scopes__.default);
    }
  }
};

// Component Registry
const components = [
  {
    componentName: "SearchContainer",
    endpoint: remoteEndpoints.searchContainer,
  },
];

(async () => {
  try {
    await loadMfeStore();
    for (const { componentName, endpoint } of components) {
      await loadAndRegisterComponent(componentName, endpoint);
    }
  } catch (error) {
    console.error("Error loading components:", error);
  }
})();