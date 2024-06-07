import { Panel, PanelHeader, PanelHeaderBack, Group, RichCell, ButtonGroup, Button, Header, Pagination, Div, Spinner, Separator, Banner, Avatar, Subhead, Link, FixedLayout } from '@vkontakte/vkui';
import {Image as VKImage} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import React, { useEffect, useState, useCallback } from "react";
import { Icon36Delete, Icon28CheckCircleFill, Icon28CancelCircleFillRed, Icon48Block, Icon32LinkCircleOutline, Icon16Link, Icon16ChevronUpCircle } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';
import PropTypes, { func } from 'prop-types';
import { AddImgMaxRes } from '../service/AddImgMaxRes';
import { useMetaParams } from '@vkontakte/vk-mini-apps-router';
import { loadImage, compareImages } from '../service/SearchCopyService'
import { setAlbumNum } from '../service/SetAlbumNum';

export const SearchCopy = ({ id, fetchedUser, vkUserAuthToken }) => {
  const routeNavigator = useRouteNavigator();
  const params = useMetaParams();
  const album = params?.item;
  const warningGradient = 'linear-gradient(90deg, #ffb73d 0%, #ffa000 100%)';

  const [albumsImages, setAlbumsImages] = useState(null);
  const [newAlbumsImages, setNewAlbumsImages] = useState(null);
  const [diffImagesArray, setDiffImagesArray] = useState(null);
  const photosCount = (album?.size > 1000) ? 1000 : album?.size;
  const [offset, setOffset] = useState(0);

  const [pagesCountArr, setPagesCountArr] = useState(null);
  const [page, setPage] = useState(1);
  const [photosLeftOnPage, setPhotosLeftOnPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAlbumsImages() {
      const albumsImages = await bridge.send("VKWebAppCallAPIMethod", {
        method: "photos.get",
        params: {
          owner_id: fetchedUser?.id,
          album_id: album?.id,
          access_token: vkUserAuthToken?.access_token,
          v: "5.131",
          count: photosCount,
          rev: 1,
          offset: offset,
        },
      });
      setAlbumsImages(albumsImages.response.items);
    }
    fetchAlbumsImages()
      .then().catch(error => {
        console.log(error)
        setError(1);
      });
  }, [offset]);

  useEffect(() => {
    if (albumsImages) {
      function imageMaxResolution(imgArray) {
        imgArray.map((img) => {
          AddImgMaxRes(img)
        })
        setNewAlbumsImages(imgArray)
      }
      imageMaxResolution(albumsImages)
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
    }
  }, [albumsImages])

  useEffect(() => {
    if (newAlbumsImages) {
      const findSimilarImages = async (imageArray) => {
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
        const diff = new Uint8ClampedArray(preloadedImages[0].createdImg.data.length);

        for (let i = 0; i < preloadedImages.length; i++) {
          if (seenIds.has(preloadedImages[i].id)) continue
          for (let j = i + 1; j < preloadedImages.length; j++) {
            const compareImagesArr = await compareImages(preloadedImages[i].createdImg, preloadedImages[j].createdImg, diff);
            if (compareImagesArr !== -1 && compareImagesArr < 40) {
              preloadedImages[j].similarityPercent = Math.floor(100 - (compareImagesArr/400*100));
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

  const pages = function(i) {
    if (i != page) {
      setPage(i)
      setDiffImagesArray(null)
      setOffset((i-1)*photosCount)
    }
  }

  return (
    <Panel id={id}>
        <FixedLayout vertical="bottom" style={{ left: '16px', bottom: '56px', pointerEvents: 'none' }}>
          <Button size="l" mode="primary" style={{ pointerEvents: 'auto'}} rounded onClick={() => {window.scrollTo({ top: 0, behavior: 'smooth' })}}>
            <Icon16ChevronUpCircle />
          </Button>
        </FixedLayout>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.replace('/albums', { state: { fetchedUser, vkUserAuthToken } })} />}>
          Поиск копий
        </PanelHeader>
        <Group header={<Header 
          mode="primary"
          indicator={!error && `${diffImagesArray?.length ?? "..."} из ${photosCount}`}
          >{album?.title}
          </Header>}>
        </Group>
      {error && 
        <Banner
        before={<Icon28CancelCircleFillRed />}
        header="Ошибка загрузки :("
        subheader={
          <React.Fragment>
            Попробуйте перезайти в альбом или перезагрузить приложение
          </React.Fragment>
        }/>}
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
