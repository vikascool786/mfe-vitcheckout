export const truncate = (text: string, limit: number) => {
  const toTruncate = text.length > limit;
  const displayText = toTruncate ? text.slice(0, limit) + "..." : text;
  return displayText;
};
