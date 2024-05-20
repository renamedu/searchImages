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
        const width = 20;
        const height = 20;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        return imgData;
    } catch (error) {
        throw new Error('Failed to load image');
    }
}
// Function to compare two images
export const compareImages = async function (img1, img2, diff) {
    try {
        const numDiff = pixelmatch(img1.data, img2.data, diff, 20, 20);
        return numDiff;
    } catch (error) {
        console.error('Error comparing images:', error);
        return -1;
    }
}