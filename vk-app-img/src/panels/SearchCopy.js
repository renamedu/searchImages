import { Panel, PanelHeader, PanelHeaderBack, Group, RichCell, ButtonGroup, Button, Header, Div, Separator, Banner, Avatar, Subhead, Link, FixedLayout, SimpleCell, InfoRow, Spacing } from '@vkontakte/vkui';
import {Image as VKImage} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import React, { useEffect, useState, useCallback } from "react";
import { Icon36Delete, Icon28CheckCircleFill, Icon28CancelCircleFillRed, Icon48Block, Icon32LinkCircleOutline, Icon16Link, Icon16ChevronUpCircle } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';
import PropTypes, { func } from 'prop-types';
import { imageMaxResolution } from '../service/AddImgMaxRes';
import { useMetaParams } from '@vkontakte/vk-mini-apps-router';
import { useSearchParams } from '@vkontakte/vk-mini-apps-router';
import { loadImage, compareImages, preloadImagesInChunks } from '../service/SearchCopyService'
import { setAlbumNum } from '../service/SetAlbumNum';
import { getAlbumPhotos } from '../service/FetchAlbumsPhotos';
import { getSearchTime } from '../service/GetSearchTime';
import { checkAndShowAds } from '../service/CheckAndShowAds';

import ScrollToTopButton from '../components/ScrollToTopButton';
import ErrorBanner from '../components/ErrorBanner';
import ProgressBar from '../components/ProgressBar';

export const SearchCopy = ({ id, fetchedUser, vkUserAuthToken }) => {
  const routeNavigator = useRouteNavigator();
  const [params, setParams] = useSearchParams();
  const albumId = params.get('albumId')
  const albumTitle = params.get('title')
  const albumSize = params.get('size')
  const warningGradient = "linear-gradient(90deg, #ffb73d 0%, #ffa000 100%)";
  const [error, setError] = useState(null);
  const [pagesCountArr, setPagesCountArr] = useState(null);
  const [page, setPage] = useState(1);
  const photosCount = (albumSize > 2000) ? 2000 : albumSize;
  const [photosOnPage, setPhotosOnPage] = useState(photosCount);
  const [offset, setOffset] = useState(0);
  const [diffImagesArray, setDiffImagesArray] = useState(null);
  const [searchTimeReq, setsearchTimeReq] = useState(null);
  const [searchLoading, setSearchLoading] = useState(null);
  const [searchButtonDisabled, setSearchButtonDisabled] = useState(null);
  const [lastSearchTime, setLastSearchTime] = useState(null);

  const checkSearchStory = async function() {
    const checkTime = Date.now()
    bridge.send('VKWebAppStorageGet', {
        keys: [
            albumId
        ]})
        .then((data) => { 
            if (data.keys[0].value) {
              const searchDate = new Date(+data.keys[0].value)
              setLastSearchTime(searchDate.toLocaleString())
              if (checkTime - data.keys[0].value < 3600000) {
                setSearchButtonDisabled(true)
              }
          }
        })
        .catch((error) => {console.log(error)});
  }
  const setSearchStory = async function(searchTime) {
    bridge.send('VKWebAppStorageSet', {
        key: albumId,
        value: searchTime
    })
    .then((data) => {})
    .catch((error) => {console.log(error)});
  }
  const getPagesCountArr = function(albumSize) {
    const pagesCount = Math.ceil(albumSize / 2000)
    const pagesCountArr = [];
    for (let i = 0; i < pagesCount; i++) {
        pagesCountArr[i] = i + 1;
    }
    return pagesCountArr;
  }
  const pages = function(number) {
    if (number != page) {
      setPage(number)
      setDiffImagesArray(null)
      setOffset((number-1)*photosCount)
      if (number == pagesCountArr.length) {
        setPhotosOnPage(albumSize)
      } else {
        setPhotosOnPage(number*photosCount)
      }
    }
  }
  useEffect(() => {
      if (albumSize > 0) {
        checkSearchStory()
        setsearchTimeReq(getSearchTime(albumSize))
        setPagesCountArr(getPagesCountArr(albumSize))
    } else if (albumSize == 0) {
        setDiffImagesArray([]);
    }
  }, [])

  async function fetchAlbumsImages() {
    try {
        if (albumSize - offset > 1000) {
            const getAlbumsImages1 = await getAlbumPhotos(fetchedUser?.id, albumId, vkUserAuthToken?.access_token, 1000, offset);
            const getAlbumsImages2 = await getAlbumPhotos(fetchedUser?.id, albumId, vkUserAuthToken?.access_token, 1000, offset+1000);
            return ([...getAlbumsImages1.response.items, ...getAlbumsImages2.response.items]);
        } else {
            const getAlbumsImages = await getAlbumPhotos(fetchedUser?.id, albumId, vkUserAuthToken?.access_token, albumSize, offset);
            return ([...getAlbumsImages.response.items]);
        }
    } catch (error) {
        console.log(error);
    }
  }

  const findSimilarImages = async (preloadedImages) => {
    const similarImages = [];
    const seenIds = new Set();
    const diff = new Uint8ClampedArray(400);

    for (let i = 0; i < preloadedImages.length; i++) {
      if (seenIds.has(preloadedImages[i].id)) continue;
      for (let j = i + 1; j < preloadedImages.length; j++) {
        const compareImagesArr = await compareImages(preloadedImages[i].createdImg, preloadedImages[j].createdImg, diff);
        if (compareImagesArr !== -1 && compareImagesArr < 6) {
          preloadedImages[j].similarityPercent = Math.floor(100 - (compareImagesArr / 100 * 100));
          if (!seenIds.has(preloadedImages[i].id)) {
            preloadedImages[i].similarImages = [];
            similarImages.push(preloadedImages[i]);
            seenIds.add(preloadedImages[i].id);
          }
          const { createdImg, ...similarImg } = preloadedImages[j];
          preloadedImages[i].similarImages.push(similarImg);
          seenIds.add(preloadedImages[j].id);
        }
      }
      delete preloadedImages[i].createdImg;
    }
    return similarImages;
  };

  const fetchAndSearchCopy = async function() {
    setSearchButtonDisabled(true)
    try {
        setSearchLoading(["accent", 10])
        let AlbumsImagesArray = await fetchAlbumsImages();
        let AlbumsImagesWithRes = await imageMaxResolution(AlbumsImagesArray);
        setSearchLoading(["accent", 33])
        let preloadedImages = await preloadImagesInChunks(AlbumsImagesWithRes, 500);
        let similarImages = await findSimilarImages(preloadedImages);
        const searchTime = Date.now()
        setDiffImagesArray(similarImages);
        setSearchLoading(["positive", 100])
        setSearchStory(searchTime.toString())
        checkAndShowAds();
        setTimeout(() => {setSearchLoading(null)}, 3000);
        AlbumsImagesArray = null;
        AlbumsImagesWithRes = null;
        preloadedImages = null;
        similarImages = null;
      } catch (error) {
        setSearchButtonDisabled(false)
        setError(1);
        console.error('An error occurred:', error);
      }
  }

  return (
    <Panel id={id}>
      <ScrollToTopButton />
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.replace('/albums', { state: { fetchedUser, vkUserAuthToken } })} />}>
        Поиск копий
      </PanelHeader>
      <Group header={<Header mode="primary" indicator={albumSize}>{albumTitle}</Header>}>
        { (albumSize > 0) && <>
            <SimpleCell>
                <InfoRow header={lastSearchTime && `Крайний поиск: ${lastSearchTime}`}>{`Приблизительное время поиска: ${searchTimeReq}.`}</InfoRow>
                <InfoRow header="Во время поиска возможно зависание приложения.">{`Время поиска зависит от устройства.`}</InfoRow>
            </SimpleCell>
            { (albumSize > 2000) && <Banner
                before={
                <Avatar size={20} style={{ backgroundImage: warningGradient }}>
                    <span style={{ color: "#fff" }}>!</span>
                </Avatar>
                }
                header="Поиск ограничен 2000 фото"
            />}
            { (albumSize > 2000) && <Div>
                {pagesCountArr && <Subhead style={{justifyContent: 'center', textAlign: 'center'}} >Страница {page} из {pagesCountArr.length}</Subhead>}
                <br />
                {photosOnPage && <Subhead style={{justifyContent: 'center', textAlign: 'center'}} >Изображения {offset+1} - {photosOnPage}</Subhead>}
            </Div>}
            { (albumSize > 2000) &&  <ButtonGroup mode="horizontal" gap="none" align="center" stretched>
                {pagesCountArr?.map((number) => {
                    return (
                    <Button
                    key={number}
                    mode="secondary"
                    appearance="accent"
                    size="s"
                    stretched
                    onClick={() => {pages(number)}}
                    >
                        {number}
                    </Button>
                    )
                })}
            </ButtonGroup>}
            <Spacing />
            <ButtonGroup mode="horizontal" gap="s" stretched>
                <Button 
                    mode="primary" 
                    size="l" 
                    stretched 
                    onClick={() => {fetchAndSearchCopy()}}
                    disabled={searchButtonDisabled && true}
                >
                    {searchLoading && "Поиск..." || "Найти копии"}
                </Button>
            </ButtonGroup>
            <Spacing />
            {searchLoading && <ProgressBar appearance={searchLoading[0]} value={searchLoading[1]}/>}
            <Spacing />
            {searchButtonDisabled && <Banner
                before={
                <Avatar size={20} style={{ backgroundImage: warningGradient }}>
                    <span style={{ color: "#fff" }}>!</span>
                </Avatar>
                }
                header="Для каждого альбома возможно выполнить поиск раз в час"
            />}
        </>}
      </Group>
      {error && <ErrorBanner />}
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
                  <Link href={`https://vk.com/album${fetchedUser?.id}_${setAlbumNum(albumId)}?z=photo${fetchedUser?.id}_${img.id}%2Falbum${fetchedUser?.id}_${setAlbumNum(albumId)}%2Frev`} target="_blank">
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
                      <Link href={`https://vk.com/album${fetchedUser?.id}_${setAlbumNum(albumId)}?z=photo${fetchedUser?.id}_${innerImg.id}%2Falbum${fetchedUser?.id}_${setAlbumNum(albumId)}%2Frev`} target="_blank">
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
      {!error && albumSize > 0 && diffImagesArray?.length === 0 && (
        <Div>
            <Banner
            before={<Icon28CheckCircleFill />}
            header="Нет копий"
            />
        </Div>
        )}
    </Panel>
  );
};