export function getCardType(number: string): string {
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(number)) return "Visa";

  if (
      /^5[0-8][0-9]{14}$/.test(
      number
    )
  )
    return "Mastercard";

  if (/^3[47][0-9]{13}$/.test(number)) return "AMEX";

  if (
      /^6(\d{15}|\d{18})$/.test(
      number
    )
  )
    return "Discover";

  if (/^36/.test(number)) return "Diners";

  if (/^30[0-5]/.test(number)) return "Diners - Carte Blanche";

  if (/^(?:(?:1800|35(2[8-9]|[3-8]\d))\d{12})$/.test(number)) return "JCB";

  if (/^(4026|417500|4508|4844|491(3|7))/.test(number)) return "Visa Electron";

  return "";
}
