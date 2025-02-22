export const truncate = (text: string, limit: number) => {
  const toTruncate = text.length > limit;
  const displayText = toTruncate ? text.slice(0, limit) + "..." : text;
  console.log("dis", toTruncate, displayText);
  return displayText;
};
