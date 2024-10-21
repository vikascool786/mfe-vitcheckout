export const setAddressBarUrl = (url: string) => {
  history.pushState({}, "", url);
};
