export const priceFormat = (price: string | number) => {
  const numPrice = +price;
  return numPrice.toFixed(2);
};
