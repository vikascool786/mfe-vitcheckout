export const NOT_A_MOBILE_PHONE_NUMBER = (getString: (key: string) => string) =>
  getString("notAMobilePhoneNumber");

export const INVALID_COUNTRY_MOBILE_NUMBER = (
  matchingCountryName: string,
  expectedCountryName: string,
  getString:any
) =>
  getString("wrongCountryNumber",[matchingCountryName,expectedCountryName]);
