export const NOT_A_MOBILE_PHONE_NUMBER =
  "The phone number you entered is not a mobile phone number";

export const MOBILE_NUMBER_NOT_VALID = "The phone number entered is not valid";

export const INVALID_COUNTRY_MOBILE_NUMBER = (
  matchingCountryName: string,
  expectedCountryName: string
) =>
  `The mobile phone number you have entered is for ${matchingCountryName}. Please add a mobile phone number for ${expectedCountryName} or leave empty.`;
