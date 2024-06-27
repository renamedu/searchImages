import { Panel, PanelHeader, PanelHeaderBack, Group, RichCell, ButtonGroup, Button, Header, Pagination, Div, Spinner, Separator, Banner, Avatar, Subhead, Link, FixedLayout } from '@vkontakte/vkui';
import {Image as VKImage} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import React, { useEffect, useState, useCallback } from "react";
import { Icon36Delete, Icon28CheckCircleFill, Icon28CancelCircleFillRed, Icon48Block, Icon32LinkCircleOutline, Icon16Link, Icon16ChevronUpCircle } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';
import PropTypes, { func } from 'prop-types';
import { imageMaxResolution } from '../service/AddImgMaxRes';
import { useMetaParams } from '@vkontakte/vk-mini-apps-router';
import { loadImage, compareImages } from '../service/SearchCopyService'
import { setAlbumNum } from '../service/SetAlbumNum';
import { getAlbumPhotos } from '../service/FetchAlbumsPhotos';
import ScrollToTopButton from '../components/ScrollToTopButton';
import ErrorBanner from '../components/ErrorBanner';

export const SearchCopy = ({ id, fetchedUser, vkUserAuthToken }) => {
  const routeNavigator = useRouteNavigator();
  const params = useMetaParams();
  const album = params?.item;
  const warningGradient = 'linear-gradient(90deg, #ffb73d 0%, #ffa000 100%)';
  const [error, setError] = useState(null);
  const [pagesCountArr, setPagesCountArr] = useState(null);
  const [page, setPage] = useState(1);
  const photosCount = (album?.size > 1000) ? 1000 : album?.size;
  const [photosLeftOnPage, setPhotosLeftOnPage] = useState(null);
  const [offset, setOffset] = useState(0);
  const [diffImagesArray, setDiffImagesArray] = useState(null);

  const [albumsImages, setAlbumsImages] = useState(null);
  const [newAlbumsImages, setNewAlbumsImages] = useState(null);

  function roughSizeOfObject(object) {
    var objectList = [];
    var stack = [object];
    var bytes = 0;
    while (stack.length) {
        var value = stack.pop();
        if (typeof value === 'boolean') {
            bytes += 4;
        } else if (typeof value === 'string') {
            bytes += value.length * 2;
        } else if (typeof value === 'number') {
            bytes += 8;
        } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
            objectList.push(value);

            for (var i in value) {
                if (value.hasOwnProperty(i)) {
                    stack.push(value[i]);
                }
            }
        }
    }
    return bytes;
  }
  // albumsImages && console.log("albumsImages: "+roughSizeOfObject(albumsImages))

  //1 Получение Изображений по оффсету
  useEffect(() => {
    async function fetchAlbumsImages() {
      try {
        const getAlbumsImages = await getAlbumPhotos(fetchedUser?.id, album?.id, vkUserAuthToken?.access_token, photosCount, offset);
        setAlbumsImages([...getAlbumsImages.response.items]);
      } catch (error) {
        console.log(error);
        setError(1);
      }
    }
    fetchAlbumsImages();
  }, [offset]);

  //2 Если Альбом не пустой -
  useEffect(() => {
    if (albumsImages?.length > 0) {
      // function imageMaxResolution(imgArray) {
      //   imgArray.forEach((img) => {
      //     AddImgMaxRes(img);
      //   });
      //   setNewAlbumsImages(imgArray);
      // }

      // imageMaxResolution(albumsImages);

      const AddImgMaxRes = imageMaxResolution(albumsImages);
      setNewAlbumsImages(AddImgMaxRes);
      
      function calcPagesCount(album) {
        const pagesCount = Math.ceil(album.size / 1000)
        const pagesCountArr = [];
        for (var i = 0; i < pagesCount; i++) {
            pagesCountArr[i] = i + 1;
        }
        setPagesCountArr(pagesCountArr);
        let photosLeftOnPage = (page == pagesCountArr?.length) ? (album?.size) : page*photosCount
        setPhotosLeftOnPage(photosLeftOnPage)
      }
      calcPagesCount(album)
    } else if (albumsImages?.length == 0) {
      setDiffImagesArray([]);
    }
  }, [albumsImages])

  const pages = function(i) {
    if (i != page) {
      setPage(i)
      setDiffImagesArray(null)
      setOffset((i-1)*photosCount)
    }
  }

  //3 Если есть изобаржения - поиск копий
  useEffect(() => {
    if (newAlbumsImages) {
      // console.log("newAlbumsImages: "+roughSizeOfObject(newAlbumsImages))
      const findSimilarImages = async (imageArray) => {
        const similarImages = [];
        const seenIds = new Set(); // To track unique IDs
        const prepreloadedImages = await Promise.all(imageArray.map(async (image) => {
          try {
            const createdImg = await loadImage(image.imgMaxResolution.comparsionSize);
            return {
              album_id: image.album_id,
              date: image.date,
              id: image.id,
              imgMaxResolution: image.imgMaxResolution,
              owner_id: image.owner_id,
              web_view_token: image.web_view_token,
              createdImg: createdImg,
            };
          } catch (error) {
            console.warn(`Skipping image with id ${image.id} due to load error.`);
            return null; // Return null for images that fail to load
          }
        }));
        // Filter out images that failed to load (null values)
        const preloadedImages = prepreloadedImages.filter(image => image !== null);
        const diff = new Uint8ClampedArray(preloadedImages[0].createdImg.data.length);

        for (let i = 0; i < preloadedImages.length; i++) {
          if (seenIds.has(preloadedImages[i].id)) continue
          for (let j = i + 1; j < preloadedImages.length; j++) {
            const compareImagesArr = await compareImages(preloadedImages[i].createdImg, preloadedImages[j].createdImg, diff);
            if (compareImagesArr !== -1 && compareImagesArr < 6) {
              preloadedImages[j].similarityPercent = Math.floor(100 - (compareImagesArr/100*100));
              // Check if ID is not seen before pushing
              if (!seenIds.has(preloadedImages[i].id)) {
                preloadedImages[i].similarImages = [];
                similarImages.push(preloadedImages[i]);
                seenIds.add(preloadedImages[i].id);
              }
              preloadedImages[i].similarImages.push(preloadedImages[j])
              seenIds.add(preloadedImages[j].id);
            }
          }
        }
        setDiffImagesArray(similarImages);
        return similarImages;
      };
      findSimilarImages(newAlbumsImages)
        .then()
        .catch(error => {
          console.error('Error finding similar images:', error);
          setError(1);
        });
    }
  }, [newAlbumsImages]);

  return (
    <Panel id={id}>
      <ScrollToTopButton />
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.replace('/albums', { state: { fetchedUser, vkUserAuthToken } })} />}>
        Поиск копий
      </PanelHeader>
      <Group header={<Header mode="primary" indicator={album?.size}>{album?.title}</Header>}>
        <RichCell
          subhead="Subhead"
          text="Text"
          caption={<Banner
            before={
              <Avatar size={20} style={{ backgroundImage: warningGradient }}>
                <span style={{ color: '#fff' }}>!</span>
              </Avatar>
            }
            header="Поиск ограничен 1000 фото, вследствие ограничений вк"
          />}
          actions={
            <ButtonGroup mode="horizontal" gap="s" stretched>
              <Button mode="primary" size="s">
                Primary
              </Button>
              <Button mode="secondary" size="s">
                Secondary
              </Button>
            </ButtonGroup>
          }
        >
          {`На -data- копий найдено: -number-`}
        </RichCell>
        <Subhead style={{justifyContent: 'center', textAlign: 'center'}} >Страница {page} из {pagesCountArr?.length}</Subhead>
        <br />
        <Subhead style={{justifyContent: 'center', textAlign: 'center'}} >{offset+1} - {photosLeftOnPage}</Subhead>
        {/* <ButtonGroup mode="horizontal" gap="none" align="center" stretched>
          {pagesCountArr?.map((i) => {
            return (
              <Button
              key={i}
              mode="secondary"
              appearance="accent"
              size="s"
              stretched
              onClick={() => {pages(i)}}
              >
                {i}
              </Button>
            )
          })}
        </ButtonGroup> */}
      </Group>
      {error && <ErrorBanner />}
      {!diffImagesArray && !error &&
      <Div>
        <Banner
          before={
            <Avatar size={28} style={{ backgroundImage: warningGradient }}>
              <span style={{ color: '#fff' }}>!</span>
            </Avatar>
          }
          header="Выполняется поиск копий..."
          subheader={
            <React.Fragment>
              • Во время поиска возможно зависание приложения
              <br />
              • Приблизительное время для 500 фото - менее минуты
              <br />
              • Загрузка 1000 фото - 3 мин, однако может занять больше времени
              <br />
              • Время поиска зависит от устройства (смартфон/пк)
            </React.Fragment>
          }
        />
      </Div>}
      {diffImagesArray?.map((img, index) => {
        let date = new Date(img.date * 1000);
        let imgPreviewUrls = [];
        imgPreviewUrls.push(img.imgMaxResolution.url)
        const showImages = function(imgPreviewUrls) {
          bridge.send('VKWebAppShowImages',{
            images: imgPreviewUrls
          })
        }
        return (
          <Group key={index}>
            <RichCell
              key={index}
              before={<VKImage 
                size={96} 
                src={img.imgMaxResolution.previewImg} 
                alt="Image" 
                borderRadius="s" 
                onClick={() => {showImages(imgPreviewUrls)}}
              >
              </VKImage>}
              after={`${index + 1} из ${diffImagesArray.length}`}
              text={`${img.imgMaxResolution.width}x${img.imgMaxResolution.height}`}
              actions={
                <ButtonGroup mode="horizontal" gap="s" stretched>
                  <Link href={`https://vk.com/album${fetchedUser?.id}_${setAlbumNum(album?.id)}?z=photo${fetchedUser?.id}_${img.id}%2Falbum${fetchedUser?.id}_${setAlbumNum(album?.id)}%2Frev`} target="_blank">
                    Фото в альбоме <Icon16Link />
                  </Link>
                </ButtonGroup>
              }
            >
              {date.toLocaleDateString()}
            </RichCell>
            {img.similarImages.map((innerImg, innerIndex) => {
              let date2 = new Date(innerImg.date * 1000);
              imgPreviewUrls.push(innerImg.imgMaxResolution.url)
              return (
                <RichCell
                  key={innerIndex}
                  before={<VKImage
                    size={96}
                    src={innerImg.imgMaxResolution.previewImg}
                    alt="Image"
                    borderRadius="s"
                    onClick={() => {showImages(imgPreviewUrls)}}
                  >
                  </VKImage>}
                  text={`${innerImg.imgMaxResolution.width}x${innerImg.imgMaxResolution.height}`}
                  caption={`Сходство: ${innerImg.similarityPercent}%`}
                  actions={
                    <ButtonGroup mode="horizontal" gap="s" stretched>
                      <Link href={`https://vk.com/album${fetchedUser?.id}_${setAlbumNum(album?.id)}?z=photo${fetchedUser?.id}_${innerImg.id}%2Falbum${fetchedUser?.id}_${setAlbumNum(album?.id)}%2Frev`} target="_blank">
                        Фото в альбоме<Icon16Link />
                      </Link>
                    </ButtonGroup>
                  }
                >
                  {date2.toLocaleDateString()}
                </RichCell>
              )
            })}
          </Group>
        )
      })}
      {!error && diffImagesArray?.length == 0 ? 
        <Div>
          <Banner
            before={<Icon28CheckCircleFill />}
            header="Нет копий"
          />
        </Div> : ""
      }
      {(album?.size > 1000) && !error &&
        <Div>
          <Banner
            before={
              <Avatar size={28} style={{ backgroundImage: warningGradient }}>
                <span style={{ color: '#fff' }}>!</span>
              </Avatar>
            }
            header="Поиск ограничен 1000 фото, вследствие ограничений вк"
          />
            <Subhead style={{justifyContent: 'center', textAlign: 'center'}} >Страница {page} из {pagesCountArr?.length}</Subhead>
            <br />
            <Subhead style={{justifyContent: 'center', textAlign: 'center'}} >{offset+1} - {photosLeftOnPage}</Subhead>
          <ButtonGroup mode="horizontal" gap="none" align="center" stretched>
          {pagesCountArr?.map((i) => {
            return (
              <Button
              key={i}
              mode="secondary"
              appearance="accent"
              size="s"
              stretched
              onClick={() => {pages(i)}}
              >
                {i}
              </Button>
            )
          })}
          </ButtonGroup>
        </Div>
      }
    </Panel>
  );
};

SearchCopy.propTypes = {
  id: PropTypes.string.isRequired,
};
