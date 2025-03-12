export const getVisibleCardOptionsImages = (imgTag: string) => {
  if (!imgTag.includes("http")) {
    let newPath = imgTag.replace("^imageserver", "Image");
    let fullUrl = "https://img.shop.com/" + newPath;
    return fullUrl;
  }
  return imgTag;
};
