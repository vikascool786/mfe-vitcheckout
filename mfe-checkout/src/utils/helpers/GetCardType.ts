export function getCardType(number: string): string {
  if (/^4/.test(number)) return "Visa";

  if (
    /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(
      number
    )
  )
    return "Mastercard";

  if (/^3[47]/.test(number)) return "AMEX";

  if (
    /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/.test(
      number
    )
  )
    return "Discover";

  if (/^36/.test(number)) return "Diners";

  if (/^30[0-5]/.test(number)) return "Diners - Carte Blanche";

  if (/^35(2[89]|[3-8][0-9])/.test(number)) return "JCB";

  if (/^(4026|417500|4508|4844|491(3|7))/.test(number)) return "Visa Electron";

  return "";
}
