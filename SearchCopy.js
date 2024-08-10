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
  // albumsImages && console.log(albumsImages);

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
  // newAlbumsImages && console.log(newAlbumsImages);

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
          
          // Create diff canvas
          const diffCanvas = document.createElement('canvas');
          diffCanvas.width = width;
          diffCanvas.height = height;
          const diffCtx = diffCanvas.getContext('2d');

          // Draw diff onto diff canvas
          const diffImageData = new ImageData(diff, width, height);
          diffCtx.putImageData(diffImageData, 0, 0);

          // setDiffImage(diffCanvas.toDataURL());

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
          blob: await fetchImageBlob(image.imgMaxResolution.previewImg),
        })));

        let counter = 0; // Counter for tracking progress
  
        for (let i = 0; i < preloadedImages.length; i++) {
          // console.log("loading... "+i+"out of"+preloadedImages.length)
          counter++; // Increment counter for each iteration
          if (seenIds.has(preloadedImages[i].id)) continue
          for (let j = i + 1; j < preloadedImages.length; j++) {
            const compareImagesArr = await compareImages(preloadedImages[i], preloadedImages[j], threshold);
            if (compareImagesArr[0] !== -1 && compareImagesArr[0] < 9000) {
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

  useEffect(() => {
    if (diffImagesArray) {
      function pagination (imagesCount) {
        const totalPages = Number.isInteger(imagesCount/2)?imagesCount/2:Math.floor(imagesCount / 2) + 1
        setTotalPages(totalPages)
      }
      pagination(diffImagesArray?.length || 1);
    }
  }, [diffImagesArray])

  // diffImagesArray && console.log(diffImagesArray);

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
      {/* <Group>
        {diffImage && (
          <div>
            <h2>Number of different pixels: {numDiffPixels}</h2>
            <img src={diffImage} alt="Diff" />
          </div>
        )}
      </Group> */}
    </Panel>
  );
};

SearchCopy.propTypes = {
  id: PropTypes.string.isRequired,
};

// FUNCTION VER 2 ========================================================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

useEffect(() => {
  if (newAlbumsImages) {
    // Function to compare two images
    const compareImages = async (img1, img2, threshold) => {
      try {
        const width = 75;
        const height = 75;

        // const width = Math.min(img1.width, img2.width);
        // const height = Math.min(img1.height, img2.height);

        // console.log(width, height);

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

        // const diffImageUrl = 0;

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
        createdImg: await loadImage(image.imgMaxResolution.comparsionSize),
      })));

      // let counter = 0; // Counter for tracking progress
      for (let i = 0; i < preloadedImages.length; i++) {
        // console.log("loading... "+i+"out of"+preloadedImages.length)
        // counter++; // Increment counter for each iteration
        if (seenIds.has(preloadedImages[i].id)) continue
        for (let j = i + 1; j < preloadedImages.length; j++) {
          const compareImagesArr = await compareImages(preloadedImages[i].createdImg, preloadedImages[j].createdImg, threshold);
          if (compareImagesArr[0] !== -1 && compareImagesArr[0] < 1000) {
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
        // setCounterState(counter); // Update counter state
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
// Function to create Image object from Blob
const createImage = (blob) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};
// Function to fetch image blob
const fetchImageBlob = async (imageUrl) => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to load image');
  }
  return await response.blob();
};
const loadImage = async (imageUrl) => {
  try {
    const blob = await fetchImageBlob(imageUrl);
    const img = await createImage(blob);
    return img;
  } catch (error) {
    throw new Error('Failed to load image');
  }
};

  // 75x75
  // 200 items = 35sek
  // 300 items = 77sek / iphone = 137sek
  // 400 items = 139sek
  // 500 items = 209sek

  // 50x50
  // 300 items = 35sek
  // 500 items = 93 sek

  // 30x30
  // 500 items = 37sek
  // 800 items = 87sek
  // 1000 items = 196sek, 185sek

  // 25x25
  // 1000 items = 92sek / iphone = 163sek

  // 20x20
  // 1000 items = 71sek / iphone = 107sek

  // 10x10
  // 1000 items = 17sek / iphone = 58sek

  есть функция (fetchSearchImage) которая срабатывает по кнопке. Нужно добавить обработчик который 
  при каждом нажатии на кнопку будет запускать таймер на 5 секунд(таймер при помощи Date.now()),
  и если за эти 5 секунд кол-во нажатий более 3 - выполнять другую функцию (reklama()), 
  а выполнение (fetchSearchImage) игнорировать на 4 секунды

  есть реакт кнопка и функция (fetchSearchImage), которая выполняется при нажатии на эту кнопку. 
  Нужно создать обработчик перед этой функцией, который при каждом нажатии на кнопку будет запускать таймер
   на 5 секунд(таймер при помощи Date.now()), и если за эти 5 секунд кол-во нажатий более 3, то выполнять другую 
   функцию, а выполнение (fetchSearchImage) игнорировать на 4 секунды