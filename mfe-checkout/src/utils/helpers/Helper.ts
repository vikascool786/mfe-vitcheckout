export const truncate = (text: string, limit: number) => {
  const toTruncate = text.length > limit;
  const displayText = toTruncate ? text.slice(0, limit) + "..." : text;
  return displayText;
};

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (value: string) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value);
};