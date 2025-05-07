declare global {
  interface Window {
    google: typeof google;
    FS: {
      getCurrentSessionURL: () => string;
    };
  }
}

export {};
