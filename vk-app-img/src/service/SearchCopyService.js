import pixelmatch from 'pixelmatch';
// Function to create Image object from Blob
const createImage = function (blob) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
    });
}
// Function to fetch image blob
const fetchImageBlob = async function (imageUrl) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error('Failed to load image');
    }
    return await response.blob();
}
export const loadImage = async function (imageUrl) {
    try {
        const blob = await fetchImageBlob(imageUrl);
        const img = await createImage(blob);
        const width = 10;
        const height = 10;
        // const canvas = document.createElement('canvas');
        const canvas = (typeof OffscreenCanvas !== 'undefined') 
            ? new OffscreenCanvas(width, height) 
            : document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        return imgData;
    } catch (error) {
        console.error('Failed to load image:', error);
        throw error;
    }
}
const getPreloadImages = async (imageArray) => {
    const prepreloadedImages = await Promise.all(imageArray.map(async (image) => {
      try {
        const createdImg = await loadImage(image.imgMaxResolution.comparsionSize);
        return {
          ...image,
          createdImg,
        };
      } catch (error) {
        console.warn(`Skipping image with id ${image.id} due to load error.`);
        return null;
      }
    }));
    // console.log(prepreloadedImages[0].createdImg.data.length)
    return prepreloadedImages.filter(image => image !== null);
};
const chunkArray = (array, chunkSize) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
};
export const preloadImagesInChunks = async (imageArray, chunkSize = 500) => {
    const chunks = chunkArray(imageArray, chunkSize);
    const preloadedImages = [];
    for (const chunk of chunks) {
        const chunkPreloadedImages = await getPreloadImages(chunk);
        preloadedImages.push(...chunkPreloadedImages);
    }
    return preloadedImages;
};

// Function to compare two images
export const compareImages = async function (img1, img2, diff) {
    try {
        const numDiff = pixelmatch(img1.data, img2.data, diff, 10, 10);
        return numDiff;
    } catch (error) {
        console.error('Error comparing images:', error);
        return -1;
    }
}