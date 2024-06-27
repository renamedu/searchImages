
export const AddImgMaxRes = function (img) {
  let imgMaxResolution = {
    width: 0,
    height: 0,
    url: "",
  };
  img.sizes.forEach((size) => {
    if (size.height > imgMaxResolution.height) {
      imgMaxResolution.width = size.width;
      imgMaxResolution.height = size.height;
      imgMaxResolution.url = size.url;
    }
    if (size.type === "p") {
      imgMaxResolution.previewImg = size.url;
    }
    if (size.type === "s") {
      imgMaxResolution.comparsionSize = size.url;
    }
  });
  img.imgMaxResolution = imgMaxResolution;
  img.sizes = [];
};

export const imageMaxResolution = function (imgArray) {
  imgArray.forEach((img) => {
    AddImgMaxRes(img);
  });
  return imgArray;
};


