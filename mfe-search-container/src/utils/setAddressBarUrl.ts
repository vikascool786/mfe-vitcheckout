export const setAddressBarUrlWithPush = (url: string) => {
  history.pushState({}, "", url);
};

export const setAddressBarUrlWithReplace = (url: string) => {
  history.replaceState({}, "", url);
};
