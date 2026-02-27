export const getVisibleCardOptionsImages = (imgTag: string) => {
  if (!imgTag.includes("http")) {
    let newPath = imgTag.replace("^imageserver", "Image");
    let fullUrl = "https://img.mashop.com/" + newPath;
    return fullUrl;
  }
  return imgTag;
};
