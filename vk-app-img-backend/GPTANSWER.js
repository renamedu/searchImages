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
            rev: 1,
          },
        });
        setAlbumsImages(albumsImages.response.items);
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
        // Function to compare two images
        const compareImages = async (img1, img2, threshold) => {
          try {
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
            createdImg: await loadImage(image.imgMaxResolution.comparsionSize),
          })));
  
          let counter = 0; // Counter for tracking progress
    
          for (let i = 0; i < preloadedImages.length; i++) {
            console.log("loading... "+i+"out of"+preloadedImages.length)
            counter++; // Increment counter for each iteration
            if (seenIds.has(preloadedImages[i].id)) continue
            for (let j = i + 1; j < preloadedImages.length; j++) {
              const compareImagesArr = await compareImages(preloadedImages[i].createdImg, preloadedImages[j].createdImg, threshold);
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

    // 3 GPT ANSWERRR ------======================================================

    const fs = require('fs');
    const PNG = require('pngjs').PNG;
    const pixelmatch = require('pixelmatch');
    
    async function compareImages(images) {
        // Preload images
        // const loadedImages = await Promise.all(images.map(async (image) => {
        //     const loadedImage = PNG.sync.read(fs.readFileSync(image.imgUrl));
        //     return { id: image.id, date: image.date, img: loadedImage };
        // }));

        const similarImages = [];
        const seenIds = new Set(); // To track unique IDs
        const loadedImages = await Promise.all(images.map(async (image) => ({
          album_id: image.album_id,
          date: image.date,
          id: image.id,
          imgMaxResolution: image.imgMaxResolution,
          owner_id: image.owner_id,
          web_view_token: image.web_view_token,
          img: PNG.sync.read(fs.readFileSync(image.imgMaxResolution.previewImg)),
        })));
    
        // Compare images
        // loadedImages.forEach((image1, index1) => {
        //     const similarImages = [];
        //     loadedImages.forEach((image2, index2) => {
        //         if (index1 !== index2) {
        //             const { width, height } = image1.img;
        //             const diff = new PNG({ width, height });
        //             const numDiffPixels = pixelmatch(image1.img.data, image2.img.data, diff.data, width, height, { threshold: 0.1 });
        //             if (numDiffPixels === 0) {
        //                 similarImages.push({ id: image2.id, date: image2.date, imgUrl: images[index2].imgUrl });
        //             }
        //         }
        //     });
        //     if (similarImages.length > 0) {
        //         // Add similarImages array to the image object
        //         image1.similarImages = similarImages;
        //         // Calculate the number of different pixels
        //         image1.numDiffPixels = numDiffPixels;
        //     }
        // });

        for (let i = 0; i < loadedImages.length; i++) {
            // console.log("loading... "+i+" out of "+loadedImages.length)
            if (seenIds.has(loadedImages[i].id)) continue
            for (let j = i + 1; j < loadedImages.length; j++) {

                const { width, height } = loadedImages[i].img;
                const diff = new PNG({ width, height });
                const numDiffPixels = pixelmatch(loadedImages[i].img.data, loadedImages[j].img.data, diff.data, width, height, { threshold: 0.1 });
                const diffImage = fs.writeFileSync('diff.png', PNG.sync.write(diff));
                if (numDiffPixels < 9000) {
                    loadedImages[j].numDiffPixels = numDiffPixels;
        
                    // Check if ID is not seen before pushing
                    if (!seenIds.has(loadedImages[i].id)) {
                    loadedImages[i].similarImages = [];
                    similarImages.push(loadedImages[i]);
                    seenIds.add(loadedImages[i].id);
                    }
                    loadedImages[j].diffImage = diffImage;
                    loadedImages[i].similarImages.push(loadedImages[j])
                    seenIds.add(loadedImages[j].id);
                }
            }
        }
        // return loadedImages;
        return similarImages;
    }
    
    // Usage example
    const images = [
        { id: 1, date: 123123, imgUrl: "img1.png" },
        { id: 2, date: 123123, imgUrl: "img2.png" },
        // Add more images as needed
    ];
    
    compareImages(images)
        .then(result => {
            console.log(result);
            // Do something with the result
        })
        .catch(error => {
            console.error(error);
        });
    



// 4 GPT ANSWERRRR+++++++++++++++++++++++++++++++++++++++++++++++>>>>>>>>>>>>>>>>>>>

const { createCanvas, loadImage } = require('canvas'); // For node.js canvas
const pixelmatch = require('pixelmatch');
const fs = require('fs');
const https = require('https');

const downloadImage = async (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const chunks = [];
            response.on('data', (chunk) => {
                chunks.push(chunk);
            });
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
};

async function compareImages(images) {
    const similarImages = [];
    const seenIds = new Set();

    const loadedImages = await Promise.all(images.map(async (image) => {
        try {
            const imgBuffer = await downloadImage(image.imgMaxResolution.previewImg);
            const img = await loadImage(imgBuffer);
            return {
                album_id: image.album_id,
                date: image.date,
                id: image.id,
                imgMaxResolution: image.imgMaxResolution,
                owner_id: image.owner_id,
                web_view_token: image.web_view_token,
                img,
            };
        } catch (error) {
            console.error('Error downloading image:', error);
            return null;
        }
    }));

    for (let i = 0; i < loadedImages.length; i++) {
        console.log("loading... " + i + " out of " + loadedImages.length);
        if (!loadedImages[i]) continue;
        if (seenIds.has(loadedImages[i].id)) continue;
        for (let j = i + 1; j < loadedImages.length; j++) {
            if (!loadedImages[j]) continue;
            const canvas1 = createCanvas(loadedImages[i].img.width, loadedImages[i].img.height);
            const context1 = canvas1.getContext('2d');
            context1.drawImage(loadedImages[i].img, 0, 0);
            const imageData1 = context1.getImageData(0, 0, loadedImages[i].img.width, loadedImages[i].img.height);

            const canvas2 = createCanvas(loadedImages[j].img.width, loadedImages[j].img.height);
            const context2 = canvas2.getContext('2d');
            context2.drawImage(loadedImages[j].img, 0, 0);
            const imageData2 = context2.getImageData(0, 0, loadedImages[j].img.width, loadedImages[j].img.height);

            const diff = new Uint8Array(imageData1.data.length);
            const numDiffPixels = pixelmatch(imageData1.data, imageData2.data, diff, loadedImages[i].img.width, loadedImages[i].img.height, { threshold: 0.1 });

            if (numDiffPixels < 9000) {
                loadedImages[j].numDiffPixels = numDiffPixels;
                if (!seenIds.has(loadedImages[i].id)) {
                    loadedImages[i].similarImages = [];
                    similarImages.push(loadedImages[i]);
                    seenIds.add(loadedImages[i].id);
                }
                loadedImages[i].similarImages.push(loadedImages[j]);
                seenIds.add(loadedImages[j].id);
                
                // Creating diff image URL
                const diffCanvas = createCanvas(loadedImages[i].img.width, loadedImages[i].img.height);
                const diffContext = diffCanvas.getContext('2d');
                const diffImageData = new ImageData(new Uint8ClampedArray(diff), loadedImages[i].img.width, loadedImages[i].img.height);
                diffContext.putImageData(diffImageData, 0, 0);
                loadedImages[j].diffImage = diffCanvas.toDataURL(); // Convert diff canvas to data URL
            }
        }
    }
    return similarImages;
}

// Usage example:
const images = [
    { 
        album_id: "album1",
        date: "2024-05-10",
        id: "1",
        imgMaxResolution: { previewImg: "https://example.com/image1.jpg" },
        owner_id: "user1",
        web_view_token: "token1"
    },
    { 
        album_id: "album2",
        date: "2024-05-10",
        id: "2",
        imgMaxResolution: { previewImg: "https://example.com/image2.jpg" },
        owner_id: "user2",
        web_view_token: "token2"
    }
];

compareImages(images)
    .then(similarImages => {
        console.log(similarImages);
    })
    .catch(error => {
        console.error('Error comparing images:', error);
    });

    
