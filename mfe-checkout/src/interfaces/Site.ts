export interface Site {
  siteId: number;
  locale: Locale;
  siteCountryCode: string;
}

export interface Locale {
  localeId: number;
  countryCode: string;
  currencyCode: string;
  countryCode3Char: string;
  countryName: string;
  languageCode: string;
  id: string;
  familyNameFirst: boolean;
  maLanguageCode: string;
  currencySymbol: string;
}
