export const getCountryName = (countryCode: string) => {
    const userLocale = navigator.language || "en-US"; // Fallback to English if unknown
    return new Intl.DisplayNames([userLocale], { type: "region" }).of(countryCode);
};