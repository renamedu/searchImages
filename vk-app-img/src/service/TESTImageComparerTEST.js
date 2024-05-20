import { useState, useEffect } from 'react';
import pixelmatch from 'pixelmatch';

// const ImageComparer = ({ imageUrls, threshold }) => {
//   const [diffImages, setDiffImages] = useState([]);

//   const loadImage = async (url) => {
//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error('Failed to load image');
//       }
//       const blob = await response.blob();
//       const img = new Image();
//       img.src = URL.createObjectURL(blob);
//       return img;
//     } catch (error) {
//       console.error('Error loading image:', error);
//       return null;
//     }
//   };

//   useEffect(() => {
//     const compareImages = async () => {
//       const diffImagesArray = [];

//       for (let i = 0; i < imageUrls.length; i++) {
//         const img1 = await loadImage(imageUrls[i]);
//         for (let j = i + 1; j < imageUrls.length; j++) {
//           const img2 = await loadImage(imageUrls[j]);

//           if (img1 && img2) {
//             const canvas1 = document.createElement('canvas');
//             const canvas2 = document.createElement('canvas');

//             const width = Math.min(img1.width, img2.width);
//             const height = Math.min(img1.height, img2.height);

//             canvas1.width = width;
//             canvas1.height = height;
//             canvas2.width = width;
//             canvas2.height = height;

//             const ctx1 = canvas1.getContext('2d');
//             const ctx2 = canvas2.getContext('2d');

//             ctx1.drawImage(img1, 0, 0, width, height);
//             ctx2.drawImage(img2, 0, 0, width, height);

//             const imgData1 = ctx1.getImageData(0, 0, width, height);
//             const imgData2 = ctx2.getImageData(0, 0, width, height);

//             const diff = new Uint8ClampedArray(imgData1.data.length);
//             const numDiff = pixelmatch(
//               imgData1.data,
//               imgData2.data,
//               diff,
//               width,
//               height,
//               { threshold }
//             );

//             if (numDiff > threshold) {
//               diffImagesArray.push({
//                 imgUrl1: imageUrls[i],
//                 imgUrl2: imageUrls[j],
//                 numDiffPixels: numDiff,
//               });
//             }
//           }
//         }
//       }
//       setDiffImages(diffImagesArray);
//     };

//     compareImages();
//   }, [imageUrls, threshold]);

//   return diffImages;
// };

// export default ImageComparer;

// // TEST!!!!
// // ------- gpt answer

// import { useState, useEffect } from 'react';

// const threshold = 1000000;

// const loadImage = async (url) => {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error('Failed to load image');
//     }
//     const blob = await response.blob();
//     const img = new Image();
//     img.src = URL.createObjectURL(blob);
//     return img;
//   } catch (error) {
//     console.error('Error loading image:', error);
//     return null;
//   }
// };

// const ImageComparer2 = (imagesArray, threshold) => {
//   const [diffImagesArray, setDiffImagesArray] = useState(null);

//   useEffect(() => {
//     const compareImages = async () => {
//       const diffImages = [];

//       for (let i = 0; i < imagesArray.length; i++) {
//         const img1 = await loadImage(imagesArray[i].imgMaxResolution.url);
//         for (let j = i + 1; j < imagesArray.length; j++) {
//           const img2 = await loadImage(imagesArray[j].imgMaxResolution.url);

//           if (img1 && img2) {
//             const canvas1 = document.createElement('canvas');
//             const canvas2 = document.createElement('canvas');

//             const width = Math.min(img1.width, img2.width);
//             const height = Math.min(img1.height, img2.height);

//             canvas1.width = width;
//             canvas1.height = height;
//             canvas2.width = width;
//             canvas2.height = height;

//             const ctx1 = canvas1.getContext('2d');
//             const ctx2 = canvas2.getContext('2d');

//             ctx1.drawImage(img1, 0, 0, width, height);
//             ctx2.drawImage(img2, 0, 0, width, height);

//             const imgData1 = ctx1.getImageData(0, 0, width, height);
//             const imgData2 = ctx2.getImageData(0, 0, width, height);

//             const diff = new Uint8ClampedArray(imgData1.data.length);
//             const numDiff = pixelmatch(
//               imgData1.data,
//               imgData2.data,
//               diff,
//               width,
//               height,
//               { threshold }
//             );

//             if (numDiff > threshold) {
//               diffImages.push(imagesArray[i]);
//               diffImages.push(imagesArray[j]);
//             }
//           }
//         }
//       }
//       setDiffImagesArray(diffImages);
//     };

//     compareImages();
//   }, [imagesArray, threshold]);

//   return diffImagesArray;
// };

// // Usage
// const YourComponent = ({ newAlbumsImages }) => {
//   const diffImagesArray = ImageComparer(newAlbumsImages, threshold);

//   // Render your component using diffImagesArray
// };

// // NEW GPT ANSWER -------->>>>>>

// // To address the issue of image loading not being handled properly, 
// // you can modify the loadImage function to properly handle the asynchronous 
// // loading process by returning a Promise that resolves when the image has loaded.
// // Here's how you can modify the loadImage function:

// const loadImage = (url) => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => resolve(img);
//     img.onerror = (error) => reject(error);
//     img.src = url;
//   });
// };

// // With this modification, the loadImage function now returns a Promise that
// // resolves with the image once it has successfully loaded, or rejects with an
// // error if the loading process encounters any issues.

// // Then, in your compareImages function, you need to await the loading of both images
// // before proceeding with drawing them onto the canvas. Here's the modified compareImages function:

// const compareImages = async (imagesArray) => {
//   const threshold = 1000000;
//   const diffImagesArray = [];

//   for (let i = 0; i < imagesArray.length; i++) {
//     const img1 = await loadImage(imagesArray[i].imgMaxResolution.url);
//     img1.width = imagesArray[i].imgMaxResolution.width;
//     img1.height = imagesArray[i].imgMaxResolution.height;

//     for (let j = i + 1; j < imagesArray.length; j++) {
//       const img2 = await loadImage(imagesArray[j].imgMaxResolution.url);
//       img2.width = imagesArray[j].imgMaxResolution.width;
//       img2.height = imagesArray[j].imgMaxResolution.height;

//       if (img1 && img2) {
//         const canvas1 = document.createElement('canvas');
//         const canvas2 = document.createElement('canvas');

//         const width = Math.min(img1.width, img2.width);
//         const height = Math.min(img1.height, img2.height);

//         canvas1.width = width;
//         canvas1.height = height;
//         canvas2.width = width;
//         canvas2.height = height;

//         const ctx1 = canvas1.getContext('2d');
//         const ctx2 = canvas2.getContext('2d');

//         ctx1.drawImage(img1, 0, 0, width, height);
//         ctx2.drawImage(img2, 0, 0, width, height);

//         const imgData1 = ctx1.getImageData(0, 0, width, height);
//         const imgData2 = ctx2.getImageData(0, 0, width, height);

//         const diff = new Uint8ClampedArray(imgData1.data.length);
//         const numDiff = pixelmatch(
//           imgData1.data,
//           imgData2.data,
//           diff,
//           width,
//           height,
//           threshold
//         );

//         if (numDiff > threshold) {
//           diffImagesArray.push(imagesArray[i]);
//           diffImagesArray.push(imagesArray[j]);
//         }
//       }
//     }
//   }
//   setDiffImagesArray(diffImagesArray);
// };

// [{id: 1, 
//   imgMaxResolution: {width: 1000, height: 1400, url: 'https://sun9-41.userapi.com/impg/TlKbJ1xAJXQtCiVRsyo&type=album'}},
//  {id: 2, 
//   imgMaxResolution: {width: 3333, height: 1234, url: 'https://sun9-41.userapi.com/impg/TlKbJ1xewrwerfsvVRsyo&type=album'}},
//  {id: 3, 
//   imgMaxResolution: {width: 769, height: 570, url: 'https://sun9-41.userapi.com/impg/TlKbJ1fgsdfwsdfsiVRsyo&type=album'}}]

//   import pixelmatch from 'pixelmatch';

// // Function to compare two images
// const compareImages = async (image1Url, image2Url, threshold) => {
//   try {
//     const response1 = await fetch(image1Url);
//     const response2 = await fetch(image2Url);

//     if (!response1.ok || !response2.ok) {
//       throw new Error('Failed to load image');
//     }

//     const blob1 = await response1.blob();
//     const blob2 = await response2.blob();

//     const img1 = await createImage(blob1);
//     const img2 = await createImage(blob2);

//     const width = Math.min(img1.width, img2.width);
//     const height = Math.min(img1.height, img2.height);

//     const canvas1 = createCanvas(width, height);
//     const ctx1 = canvas1.getContext('2d');
//     ctx1.drawImage(img1, 0, 0, width, height);

//     const canvas2 = createCanvas(width, height);
//     const ctx2 = canvas2.getContext('2d');
//     ctx2.drawImage(img2, 0, 0, width, height);

//     const imgData1 = ctx1.getImageData(0, 0, width, height);
//     const imgData2 = ctx2.getImageData(0, 0, width, height);

//     const diff = new Uint8ClampedArray(imgData1.data.length);
//     const numDiff = pixelmatch(imgData1.data, imgData2.data, diff, width, height, { threshold });

//     return numDiff === 0;
//   } catch (error) {
//     console.error('Error comparing images:', error);
//     return false;
//   }
// };

// // Function to create Image object from Blob
// const createImage = (blob) => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => resolve(img);
//     img.onerror = reject;
//     img.src = URL.createObjectURL(blob);
//   });
// };

// // Function to create canvas
// const createCanvas = (width, height) => {
//   const canvas = document.createElement('canvas');
//   canvas.width = width;
//   canvas.height = height;
//   return canvas;
// };

// // Function to compare images in the array
// const findSimilarImages = async (imageArray, threshold) => {
//   const similarImages = [];

//   for (let i = 0; i < imageArray.length; i++) {
//     for (let j = i + 1; j < imageArray.length; j++) {
//       const isSimilar = await compareImages(imageArray[i].imgMaxResolution.url, imageArray[j].imgMaxResolution.url, threshold);
//       if (isSimilar) {
//         similarImages.push(imageArray[i]);
//         similarImages.push(imageArray[j]);
//       }
//     }
//   }

//   return similarImages;
// };

// // Usage
// const imageArray = [
//   { id: 1, imgMaxResolution: { width: 1000, height: 1400, url: 'https://...' } },
//   { id: 2, imgMaxResolution: { width: 3333, height: 1234, url: 'https://...' } },
//   { id: 3, imgMaxResolution: { width: 769, height: 570, url: 'https://...' } }
// ];

// const threshold = 0.1;
// findSimilarImages(imageArray, threshold)
//   .then(similarImages => {
//     console.log('Similar Images:', similarImages);
//   })
//   .catch(error => {
//     console.error('Error finding similar images:', error);
//   });




  // GPT ANSWER N HZ --------------->

  const [diffImagesArray, setDiffImagesArray] = useState(null);

useEffect(() => {
  if (newAlbumsImages) {
    // Function to compare two images
    const compareImages = async (image1, image2, threshold) => {
      try {
        const img1 = await createImage(image1.blob);
        const img2 = await createImage(image2.blob);

        const width = Math.min(img1.width, img2.width);
        const height = Math.min(img1.height, img2.height);

        const canvas1 = createCanvas(width, height);
        const ctx1 = canvas1.getContext('2d');
        ctx1.drawImage(img1, 0, 0, width, height);

        const canvas2 = createCanvas(width, height);
        const ctx2 = canvas2.getContext('2d');
        ctx2.drawImage(img2, 0, 0, width, height);

        const imgData1 = ctx1.getImageData(0, 0, width, height);
        const imgData2 = ctx2.getImageData(0, 0, width, height);

        const diff = new Uint8ClampedArray(imgData1.data.length);
        const numDiff = pixelmatch(imgData1.data, imgData2.data, diff, width, height, { threshold });

        return numDiff;
      } catch (error) {
        console.error('Error comparing images:', error);
        return -1;
      }
    };

    // Function to compare images in the array
    const findSimilarImages = async (imageArray, threshold) => {
      const similarImages = [];
      const seenIds = new Set(); // To track unique IDs
      const preloadedImages = await Promise.all(imageArray.map(async (image) => ({
        album_id: image.id,
        date: image.date,
        id: image.id,
        imgMaxResolution: image.imgMaxResolution,
        owner_id: image.owner_id,
        web_view_token: image.web_view_token,
        blob: await fetchImageBlob(image.imgMaxResolution.url),
      })));

      for (let i = 0; i < preloadedImages.length; i++) {
        for (let j = i + 1; j < preloadedImages.length; j++) {
          const numDiffPixels = await compareImages(preloadedImages[i], preloadedImages[j], threshold);
          if (numDiffPixels !== -1 && numDiffPixels < 10000) {
            preloadedImages[i].numDiffPixels = numDiffPixels;
            preloadedImages[j].numDiffPixels = numDiffPixels;

            // Check if both IDs are not seen before pushing
            if (!seenIds.has(preloadedImages[i].id)) {
              similarImages.push(preloadedImages[i]);
              seenIds.add(preloadedImages[i].id);
            }
            if (!seenIds.has(preloadedImages[j].id)) {
              similarImages.push(preloadedImages[j]);
              seenIds.add(preloadedImages[j].id);
            }
          }
        }
      }
      setDiffImagesArray(similarImages);
      return similarImages;
    };

    const threshold = 0.8;
    findSimilarImages(newAlbumsImages, threshold)
      .then(similarImages => {
        console.log('Similar Images:', similarImages);
      })
      .catch(error => {
        console.error('Error finding similar images:', error);
      });
  }
}, [newAlbumsImages]);

// Function to create Image object from Blob
const createImage = (blob) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};

// Function to create canvas
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Function to fetch image blob
const fetchImageBlob = async (imageUrl) => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to load image');
  }
  return await response.blob();
};

// FIRST VERSION ------------------------------------------->

const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [diffImage, setDiffImage] = useState(null);
  const [numDiffPixels, setNumDiffPixels] = useState(0);

  const img1Url = "https://sun9-13.userapi.com/impg/vfK5JTrr-jvQIJOb8Nuo8V3xh827xQPJbVZ5CA/12gIxkm--J0.jpg?size=1459x2160&quality=95&sign=37f4dda1a93d3c8da343d1102d5cbeec&type=album";
  const img2Url = "https://sun9-62.userapi.com/impg/YW6w9RD8E7S98nrAHSxVUDrdvybJbafiKEUm4Q/mmS3Z4Ixqbc.jpg?size=1014x1500&quality=96&sign=18e3238a9fae55eab3356e7915ac1ef7&type=album";

  useEffect(() => {
    const loadImage = async (url, setImage) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to load image');
        }
        const blob = await response.blob();
        const img = new Image();
        img.onload = () => {
          setImage(img);
        };
        img.src = URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    loadImage(img1Url, setImage1);
    loadImage(img2Url, setImage2);
  }, [img1Url, img2Url]);

  useEffect(() => {
    if (image1 && image2) {
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');

      // Determine the dimensions of the smaller image
      const width = Math.min(image1.width, image2.width);
      const height = Math.min(image1.height, image2.height);

      // Set canvas dimensions
      canvas1.width = width;
      canvas1.height = height;
      canvas2.width = width;
      canvas2.height = height;

      const ctx1 = canvas1.getContext('2d');
      const ctx2 = canvas2.getContext('2d');

      // Draw images onto canvases
      ctx1.drawImage(image1, 0, 0, width, height);
      ctx2.drawImage(image2, 0, 0, width, height);

      // Get image data
      const imgData1 = ctx1.getImageData(0, 0, width, height);
      const imgData2 = ctx2.getImageData(0, 0, width, height);

      // Create diff canvas
      const diffCanvas = document.createElement('canvas');
      diffCanvas.width = width;
      diffCanvas.height = height;
      const diffCtx = diffCanvas.getContext('2d');

      // Perform pixel comparison
      const diff = new Uint8ClampedArray(imgData1.data.length);
      const numDiff = pixelmatch(imgData1.data, imgData2.data, diff, width, height, { threshold: 0.1 });

      // Draw diff onto diff canvas
      const diffImageData = new ImageData(diff, width, height);
      diffCtx.putImageData(diffImageData, 0, 0);

      // Update state
      setDiffImage(diffCanvas.toDataURL());
      setNumDiffPixels(numDiff);
    }
  }, [image1, image2]);

  // WORK VERSION TOOO ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  // useEffect(() => {
  //   if (newAlbumsImages) {
  //     // Function to compare two images
  //     const compareImages = async (image1Url, image2Url, threshold) => {
  //       try {
  //         const response1 = await fetch(image1Url);
  //         const response2 = await fetch(image2Url);
    
  //         if (!response1.ok || !response2.ok) {
  //           throw new Error('Failed to load image');
  //         }
    
  //         const blob1 = await response1.blob();
  //         const blob2 = await response2.blob();
    
  //         const img1 = await createImage(blob1);
  //         const img2 = await createImage(blob2);
    
  //         const width = Math.min(img1.width, img2.width);
  //         const height = Math.min(img1.height, img2.height);
    
  //         const canvas1 = createCanvas(width, height);
  //         const ctx1 = canvas1.getContext('2d');
  //         ctx1.drawImage(img1, 0, 0, width, height);
    
  //         const canvas2 = createCanvas(width, height);
  //         const ctx2 = canvas2.getContext('2d');
  //         ctx2.drawImage(img2, 0, 0, width, height);
    
  //         const imgData1 = ctx1.getImageData(0, 0, width, height);
  //         const imgData2 = ctx2.getImageData(0, 0, width, height);
    
  //         const diff = new Uint8ClampedArray(imgData1.data.length);
  //         const numDiff = pixelmatch(imgData1.data, imgData2.data, diff, width, height, { threshold });
    
  //         return numDiff;
  //       } catch (error) {
  //         console.error('Error comparing images:', error);
  //         return -1;
  //       }
  //     };
    
  //     // Function to create Image object from Blob
  //     const createImage = (blob) => {
  //       return new Promise((resolve, reject) => {
  //         const img = new Image();
  //         img.onload = () => resolve(img);
  //         img.onerror = reject;
  //         img.src = URL.createObjectURL(blob);
  //       });
  //     };
    
  //     // Function to create canvas
  //     const createCanvas = (width, height) => {
  //       const canvas = document.createElement('canvas');
  //       canvas.width = width;
  //       canvas.height = height;
  //       return canvas;
  //     };
    
  //     // Function to compare images in the array
  //     const findSimilarImages = async (imageArray, threshold) => {
  //       const similarImages = [];
  //       const seenIds = new Set(); // To track unique IDs
    
  //       for (let i = 0; i < imageArray.length; i++) {
  //         for (let j = i + 1; j < imageArray.length; j++) {
  //           const numDiffPixels = await compareImages(imageArray[i].imgMaxResolution.url, imageArray[j].imgMaxResolution.url, threshold);
  //           if (numDiffPixels !== -1 && numDiffPixels < 10000) {
  //             imageArray[i].numDiffPixels = numDiffPixels;
  //             imageArray[j].numDiffPixels = numDiffPixels;

  //             // Check if both IDs are not seen before pushing
  //             if (!seenIds.has(imageArray[i].id)) {
  //               similarImages.push(imageArray[i]);
  //               seenIds.add(imageArray[i].id);
  //             }
  //             if (!seenIds.has(imageArray[j].id)) {
  //               similarImages.push(imageArray[j]);
  //               seenIds.add(imageArray[j].id);
  //             }
  //           }
  //         }
  //       }
  //       setDiffImagesArray(similarImages)
  //       return similarImages;
  //     };
    
  //     const threshold = 0.8;
  //     findSimilarImages(newAlbumsImages, threshold)
  //       .then(similarImages => {
  //         console.log('Similar Images:', similarImages);
  //       })
  //       .catch(error => {
  //         console.error('Error finding similar images:', error);
  //       });
  //   }
  // }, [newAlbumsImages])

  for (let i = 0; i < preloadedImages.length; i++) {
    if (seenIds.has(preloadedImages[i].id)) continue
    for (let j = i + 1; j < preloadedImages.length; j++) {
      const compareImagesArr = await compareImages(preloadedImages[i], preloadedImages[j], threshold);
      if (compareImagesArr[0] !== -1 ) {
        preloadedImages[i].numDiffPixels = compareImagesArr[0];
        preloadedImages[j].numDiffPixels = compareImagesArr[0];

        // Check if ID is not seen before pushing
        if (!seenIds.has(preloadedImages[i].id)) {
          preloadedImages[i].similarImages = [];
          similarImages.push(preloadedImages[i]);
          seenIds.add(preloadedImages[i].id);
        }
        preloadedImages[j].diffImageUrl = compareImagesArr[1];
        preloadedImages[i].similarImages.push(preloadedImages[j])
        seenIds.add(preloadedImages[j].id);
      }
    }
  }

  // chatGPTquestion ________________________________________________________

import { Panel, PanelHeader, PanelHeaderBack, Placeholder, Group, RichCell, ButtonGroup, Button, Header, Pagination, Div, Spinner, Text } from '@vkontakte/vkui';
import {Image as VKImage} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import React, { useEffect, useState, useCallback } from "react";
import { Icon56DeleteOutlineIos } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import pixelmatch from 'pixelmatch';
import { AddImgMaxRes } from '../service/AddImgMaxRes'

import { useMetaParams } from '@vkontakte/vk-mini-apps-router';

export const SearchCopy = ({ id }) => {
  const params = useMetaParams();
  const album = params?.item;
  const user = params?.fetchedUser;
  const token = params?.vkUserAuthToken;

  const photosCount = (album?.size > 1000) ? 1000 : album?.size;

  const routeNavigator = useRouteNavigator();

  const [albumsImages, setAlbumsImages] = useState(null);
  const [newAlbumsImages, setNewAlbumsImages] = useState(null);
  const [diffImagesArray, setDiffImagesArray] = useState(null);
  const [totalPages, setTotalPages] = useState(null);

  // const pagination = function(imagesCount) {
  //   let totalPages = Number.isInteger(imagesCount/50)?imagesCount/50:Math.floor(imagesCount / 50) + 1
  //   return totalPages;
  // }
  // const totalPages = pagination(diffImagesArray?.length || 1);

  const [currentPage, setCurrentPage] = useState(1);
  const [siblingCount, setSiblingCount] = useState(1);
  const [boundaryCount, setBoundaryCount] = useState(1);
  const [firstImgInPage, setFirstImgInPage] = useState(0);

  const handleChange = React.useCallback((page) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    const getImgInPage = (currentPage) => {
      setFirstImgInPage((currentPage - 1) * 2);
    };
    getImgInPage(currentPage);
  }, [currentPage])

  useEffect(() => {
    async function fetchAlbumsImages() {
      const albumsImages = await bridge.send("VKWebAppCallAPIMethod", {
        method: "photos.get",
        params: {
          owner_id: user?.id,
          album_id: album?.id,
          access_token: token?.access_token,
          v: "5.131",
          count: photosCount,
          // offset: firstImgInPage,
          // count: 50
        },
      });
      setAlbumsImages(albumsImages.response.items);

      console.log(666)
    }
    fetchAlbumsImages();
  }, []);

  useEffect(() => {
    if (albumsImages) {
      function imageMaxResolution(imgArray) {
        imgArray.map((img) => {
          AddImgMaxRes(img)
        })
        setNewAlbumsImages(imgArray)
      }
      imageMaxResolution(albumsImages)
    }
  }, [albumsImages])

  useEffect(() => {
    if (newAlbumsImages) {
      const compareImages = async (image1, image2, threshold) => {
        try {
          const img1 = await createImage(image1.blob);
          const img2 = await createImage(image2.blob);
  
          const width = Math.min(img1.width, img2.width);
          const height = Math.min(img1.height, img2.height);
  
          const canvas1 = createCanvas(width, height);
          const ctx1 = canvas1.getContext('2d');
          ctx1.drawImage(img1, 0, 0, width, height);
  
          const canvas2 = createCanvas(width, height);
          const ctx2 = canvas2.getContext('2d');
          ctx2.drawImage(img2, 0, 0, width, height);
  
          const imgData1 = ctx1.getImageData(0, 0, width, height);
          const imgData2 = ctx2.getImageData(0, 0, width, height);
  
          const diff = new Uint8ClampedArray(imgData1.data.length);
          const numDiff = pixelmatch(imgData1.data, imgData2.data, diff, width, height, { threshold });
          
          const diffCanvas = document.createElement('canvas');
          diffCanvas.width = width;
          diffCanvas.height = height;
          const diffCtx = diffCanvas.getContext('2d');

          const diffImageData = new ImageData(diff, width, height);
          diffCtx.putImageData(diffImageData, 0, 0);

          const diffImageUrl = diffCanvas.toDataURL();
  
          return [numDiff, diffImageUrl];
        } catch (error) {
          console.error('Error comparing images:', error);
          return -1;
        }
      };
  
      const findSimilarImages = async (imageArray, threshold) => {
        const similarImages = [];
        const seenIds = new Set(); // To track unique IDs
        const preloadedImages = await Promise.all(imageArray.map(async (image) => ({
          album_id: image.album_id,
          date: image.date,
          id: image.id,
          imgMaxResolution: image.imgMaxResolution,
          owner_id: image.owner_id,
          web_view_token: image.web_view_token,
          blob: await fetchImageBlob(image.imgMaxResolution.previewImg),
        })));

        let counter = 0; // Counter for tracking progress
  
        for (let i = 0; i < preloadedImages.length; i++) {
          counter++; // Increment counter for each iteration
          if (seenIds.has(preloadedImages[i].id)) continue
          for (let j = i + 1; j < preloadedImages.length; j++) {
            const compareImagesArr = await compareImages(preloadedImages[i], preloadedImages[j], threshold);
            if (compareImagesArr[0] !== -1 && compareImagesArr[0] < 9000) {
              preloadedImages[i].numDiffPixels = compareImagesArr[0];
              preloadedImages[j].numDiffPixels = compareImagesArr[0];
  
              if (!seenIds.has(preloadedImages[i].id)) {
                preloadedImages[i].similarImages = [];
                similarImages.push(preloadedImages[i]);
                seenIds.add(preloadedImages[i].id);
              }
              preloadedImages[j].diffImageUrl = compareImagesArr[1];
              preloadedImages[i].similarImages.push(preloadedImages[j])
              seenIds.add(preloadedImages[j].id);
            }
          }
          setCounterState(counter); // Update counter state
        }
        setDiffImagesArray(similarImages);
        return similarImages;
      };
  
      const threshold = 0.1;
      findSimilarImages(newAlbumsImages, threshold)
        .then(similarImages => {
          console.log('Similar Images:', similarImages);
        })
        .catch(error => {
          console.error('Error finding similar images:', error);
        });
    }
  }, [newAlbumsImages]);

  const [counterState, setCounterState] = useState(0);
  
  const createImage = (blob) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  };
  
  const createCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };

  const fetchImageBlob = async (imageUrl) => {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to load image');
    }
    return await response.blob();
  };

  useEffect(() => {
    if (diffImagesArray) {
      function pagination (imagesCount) {
        const totalPages = Number.isInteger(imagesCount/2)?imagesCount/2:Math.floor(imagesCount / 2) + 1
        setTotalPages(totalPages)
      }
      pagination(diffImagesArray?.length || 1);
    }
  }, [diffImagesArray])

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Найти копии
      </PanelHeader>
      {!diffImagesArray && 
        <Div>
          <Spinner size="medium" style={{ margin: '20px 0' }} />
          <Text>Выполняется поиск копий: {counterState} из {photosCount}</Text>
        </Div>}
      <Group header={<Header 
        mode="primary"
        indicator={diffImagesArray?.length}
        >
          {album?.title}
        </Header>}>
        {diffImagesArray?.map((img, index) => {
          let date = new Date(img.date * 1000);

          return (
            <Group key={index}>
              <RichCell
                before={<VKImage size={96} src={img.imgMaxResolution.previewImg} alt="Image" borderRadius="s" onClick={() => {}}/>}
                after={`${index + 1} из ${diffImagesArray.length}`}
                text={`${img.imgMaxResolution.width}x${img.imgMaxResolution.height}`}
                caption={`numDiffPixels: ${img.numDiffPixels}`}
                actions={
                  <ButtonGroup mode="horizontal" gap="s" stretched>
                    <Button mode="secondary" appearance="negative" size="l" onClick={() => {}}>
                      <Icon56DeleteOutlineIos />
                    </Button>
                  </ButtonGroup>
                }
              >
                {date.toLocaleDateString()}
              </RichCell>
              {img.similarImages.map((innerImg, innerIndex) => {
                return (
                  <RichCell
                    key={innerIndex}
                    before={<VKImage size={96} src={innerImg.imgMaxResolution.previewImg} alt="Image" borderRadius="s" onClick={() => {}}/>}
                    after={`${innerIndex + 1} из ${img.similarImages.length}`}
                    text={`${innerImg.imgMaxResolution.width}x${innerImg.imgMaxResolution.height}`}
                    caption={`numDiffPixels: ${innerImg.numDiffPixels}`}
                    actions={
                      <ButtonGroup mode="horizontal" gap="s" stretched>
                        <Button mode="secondary" appearance="negative" size="l" onClick={() => {}}>
                          <Icon56DeleteOutlineIos />
                        </Button>
                      </ButtonGroup>
                    }
                  >
                    {date.toLocaleDateString()}
                    <VKImage size={96} src={innerImg.diffImageUrl} alt="Image" borderRadius="s" onClick={() => {}}/>
                  </RichCell>
                )
              })}
            </Group>
          )
        })}
      <Pagination
        currentPage={currentPage}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        totalPages={totalPages}
        onChange={handleChange}
      />
      </Group>
    </Panel>
  );
};

// GPT ANSWER OPTIMIZATION!!!!!!! =============>>>>>>>>>>>>>>>>>>>>>>>>>>

// Cache object URLs
const blobUrlCache = new Map();
// Cache for fetched images
const fetchedImageCache = new Map();

useEffect(() => {
  if (newAlbumsImages) {
    // Function to create Image object from Blob
    const createImage = (blob) => {
      return new Promise((resolve, reject) => {
        // Check if URL for the blob is already cached
        if (blobUrlCache.has(blob)) {
          const imgUrl = blobUrlCache.get(blob);
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = imgUrl;
        } else {
          const img = new Image();
          img.onload = () => {
            // Create object URL and cache it
            const imgUrl = URL.createObjectURL(blob);
            blobUrlCache.set(blob, imgUrl);
            resolve(img);
          };
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        }
      });
    };

    // Function to fetch image blob
    const fetchImageBlob = async (imageUrl) => {
      // Check if image is already fetched
      if (fetchedImageCache.has(imageUrl)) {
        return fetchedImageCache.get(imageUrl);
      }
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to load image');
      }
      const blob = await response.blob();
      // Cache fetched image
      fetchedImageCache.set(imageUrl, blob);

      return blob;
    };

    // Function to compare two images
    const compareImages = async (image1, image2, threshold) => {
      try {
        const img1 = await createImage(image1.blob);
        const img2 = await createImage(image2.blob);

        const width = Math.min(img1.width, img2.width);
        const height = Math.min(img1.height, img2.height);

        const canvas1 = createCanvas(width, height);
        const ctx1 = canvas1.getContext('2d');
        ctx1.drawImage(img1, 0, 0, width, height);

        const canvas2 = createCanvas(width, height);
        const ctx2 = canvas2.getContext('2d');
        ctx2.drawImage(img2, 0, 0, width, height);

        const imgData1 = ctx1.getImageData(0, 0, width, height);
        const imgData2 = ctx2.getImageData(0, 0, width, height);

        const diff = new Uint8ClampedArray(imgData1.data.length);
        const numDiff = pixelmatch(imgData1.data, imgData2.data, diff, width, height, { threshold });

        // Create diff canvas
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = width;
        diffCanvas.height = height;
        const diffCtx = diffCanvas.getContext('2d');

        // Draw diff onto diff canvas
        const diffImageData = new ImageData(diff, width, height);
        diffCtx.putImageData(diffImageData, 0, 0);

        const diffImageUrl = diffCanvas.toDataURL();

        return [numDiff, diffImageUrl];
      } catch (error) {
        console.error('Error comparing images:', error);
        return -1;
      }
    };

    // Function to compare images in the array
    const findSimilarImages = async (imageArray, threshold) => {
      const similarImages = [];
      const seenIds = new Set(); // To track unique IDs
      const preloadedImages = await Promise.all(imageArray.map(async (image) => ({
        album_id: image.album_id,
        date: image.date,
        id: image.id,
        imgMaxResolution: image.imgMaxResolution,
        owner_id: image.owner_id,
        web_view_token: image.web_view_token,
        blob: await fetchImageBlob(image.imgMaxResolution.comparsionSize),
      })));

      let counter = 0; // Counter for tracking progress

      for (let i = 0; i < preloadedImages.length; i++) {
        counter++; // Increment counter for each iteration
        if (seenIds.has(preloadedImages[i].id)) continue;
        for (let j = i + 1; j < preloadedImages.length; j++) {
          const compareImagesArr = await compareImages(preloadedImages[i], preloadedImages[j], threshold);
          if (compareImagesArr[0] !== -1 && compareImagesArr[0] < 500) {
            preloadedImages[i].numDiffPixels = compareImagesArr[0];
            preloadedImages[j].numDiffPixels = compareImagesArr[0];

            // Check if ID is not seen before pushing
            if (!seenIds.has(preloadedImages[i].id)) {
              preloadedImages[i].similarImages = [];
              similarImages.push(preloadedImages[i]);
              seenIds.add(preloadedImages[i].id);
            }
            preloadedImages[j].diffImageUrl = compareImagesArr[1];
            preloadedImages[i].similarImages.push(preloadedImages[j]);
            seenIds.add(preloadedImages[j].id);
          }
        }
        setCounterState(counter); // Update counter state
      }
      setDiffImagesArray(similarImages);
      return similarImages;
    };

    const threshold = 0.1;
    findSimilarImages(newAlbumsImages, threshold)
      .then(similarImages => {
        console.log('Similar Images:', similarImages);
      })
      .catch(error => {
        console.error('Error finding similar images:', error);
      });
  }
}, [newAlbumsImages]);

const [counterState, setCounterState] = useState(0);

// Function to create canvas
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};
