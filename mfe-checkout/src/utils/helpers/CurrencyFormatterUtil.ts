import { Site } from "../../interfaces/Site";

export const getFormattedPrice = (siteData: Site, price: string): string => {
  const locale = `${siteData.locale.languageCode}-${siteData.locale.countryCode}`;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: siteData.locale.currencyCode,
  }).format(Number(price));
};
