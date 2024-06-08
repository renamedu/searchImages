import { Panel, PanelHeader, PanelHeaderBack, Group, RichCell, ButtonGroup, Button, Header, Pagination, FormLayoutGroup, Spinner, Separator, Banner, FormItem, Subhead, Link, Input, Search, Caption, FixedLayout, Div } from '@vkontakte/vkui';
import {Image as VKImage} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import React, { useEffect, useState, useCallback } from "react";
import { Icon36Delete, Icon16ChevronUpCircle, Icon28CancelCircleFillRed, Icon48Block, Icon12ArrowUpRightOutSquareOutline, Icon16Link, Icon16InfoOutline, Icon24Done, Icon24User, Icon24SearchStarsOutline } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { AddImgMaxRes } from '../service/AddImgMaxRes';
import { useMetaParams } from '@vkontakte/vk-mini-apps-router';
import { setOffsetAccPage } from '../service/SetOffsetAccPage';
import { setAlbumNum } from '../service/SetAlbumNum';
import { useSearchParams } from '@vkontakte/vk-mini-apps-router';

export const SearchOriginal = ({ id, fetchedUser, vkUserAuthToken, originalAlbumId }) => {
  const routeNavigator = useRouteNavigator();

  const [params, setParams] = useSearchParams();
  const albumId = params.get('albumId')
  const albumTitle = params.get('title')
  const albumSize = params.get('size')

  const [albumsImages, setAlbumsImages] = useState(null);
  const [loadingAlbumsImages, setLoadingAlbumsImages] = useState(null);
  const [error, setError] = useState(null);

  const itemsPerPage = 50; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [siblingCount, setSiblingCount] = useState(1);
  const [boundaryCount, setBoundaryCount] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(albumSize/itemsPerPage));
  const [offset, setOffset] = useState(0);

  const [searchPageNumber, setSearchPageNumber] = useState(1);

  const handleChange = React.useCallback((page) => {
    setCurrentPage(page);
    setOffset(setOffsetAccPage(page))
    window.scrollTo(0, 0);
    bridge.send('VKWebAppCheckNativeAds', {
      ad_format: 'interstitial'
      })
      .then((data) => { 
        if (data.result) { 
          bridge.send('VKWebAppShowNativeAds', {
            ad_format: 'interstitial'
            })
            .then( (data) => { 
              if (data.result) {}
            })
            .catch((error) => { console.log(error) });
        }
      })
      .catch((error) => { console.log(error) });
  }, []);

  useEffect(() => {
    setLoadingAlbumsImages(1);
    if (vkUserAuthToken) {
      async function fetchAlbumsImages() {
        const albumsImages = await bridge.send("VKWebAppCallAPIMethod", {
          method: "photos.get",
          params: {
            owner_id: fetchedUser?.id,
            album_id: albumId,
            access_token: vkUserAuthToken?.access_token,
            v: "5.131",
            count: 1000,
            rev: 1,
            offset: offset,
          },
        });
        return albumsImages;
      }
      fetchAlbumsImages()
        .then((albumsImages) => {
          albumsImages.response.items.map((img) => {AddImgMaxRes(img)});
          setAlbumsImages(albumsImages.response.items);
          setLoadingAlbumsImages(null);
          setError(null);
        })
        .catch(error => {
          setError(1);
          console.log(error)
        });
    }
  }, [offset, vkUserAuthToken]);

  const startIndex = ((currentPage - 1) * itemsPerPage) - offset;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = albumsImages?.slice(startIndex, endIndex);

  const [searchImgResArr, setSearchImgResArr] = useState({});
  const [searchSpinner, setSearchSpinner] = useState({});

  const throttledFetchSearchImage = throttle(
  async function fetchSearchImage(imgUrl, imgId) {
    setSearchSpinner((prevState) => ({ ...prevState, [imgId]: true }))
    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imgUrl: imgUrl,
        }),
      };
      const response = await fetch('https://app51674008.ru', requestOptions);
      const searchImageResult = await response.json()
      setSearchImgResArr((prevState) => ({ ...prevState, [imgId]: searchImageResult.searchImageResult }))
    } catch (error) {
      console.log(error)
    } finally {
      setSearchSpinner((prevState) => ({ ...prevState, [imgId]: false }));
    }
  }, 1000);

  return (
      <Panel id={id}>
        <FixedLayout vertical="bottom" style={{ left: '16px', bottom: '56px', pointerEvents: 'none'}}>
          <Button size="l" mode="primary" style={{ pointerEvents: 'auto'}} rounded onClick={() => {window.scrollTo({ top: 0, behavior: 'smooth'})}}>
            <Icon16ChevronUpCircle />
          </Button>
        </FixedLayout>
          <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.replace('/albums')} />}>
            Поиск оригиналов
          </PanelHeader>
          <Group header={<Header 
            mode="primary"
            indicator={albumSize}
            >
              {albumTitle}
            </Header>}>
            {error && <Banner
              before={<Icon28CancelCircleFillRed />}
              header="Ошибка загрузки :("
              subheader={<React.Fragment>Попробуйте перезайти в альбом или перезагрузить приложение</React.Fragment>}
            />}
            { !error && albumsImages?.length > 0 &&
            <div style={{ maxWidth: '100%', overflowX: 'auto' }}><Pagination
              currentPage={currentPage}
              siblingCount={siblingCount}
              boundaryCount={boundaryCount}
              totalPages={totalPages}
              disabled={false}
              onChange={handleChange}
            /></div>}
            {!error && albumsImages?.length > 0 && <FormLayoutGroup>
              <Div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <FormItem top="Введите номер страницы">
                  <input type="number" width="auto" min="1" max={totalPages} value={searchPageNumber} onChange={(e) => {setSearchPageNumber(e.target.value)}} />
                </FormItem>
                <FormItem>
                  <Button size="l" stretched onClick={() => {
                      handleChange(Number(searchPageNumber))
                    }} disabled={searchPageNumber > totalPages || searchPageNumber < 1 || searchPageNumber == currentPage} >
                    Перейти
                  </Button>
                </FormItem>
              </Div>
            </FormLayoutGroup>}
          </Group>
          { loadingAlbumsImages && <Spinner size="large" style={{ margin: '20px 0' }} />}
        { !error && !loadingAlbumsImages && albumsImages?.length > 0 && currentPageItems?.map((img, index) => {
          let imgId = img.id;
          let date = new Date(img.date * 1000);
          if (searchSpinner[imgId] === undefined) { // Added line
            setSearchSpinner((prevState) => ({ ...prevState, [imgId]: false })); // Added line
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
                  onClick={() => {bridge.send('VKWebAppShowImages',{images: [img.imgMaxResolution.url]})}}
                ></VKImage>}
                after={`${index + 1 + ((currentPage - 1) * itemsPerPage)} из ${albumSize}`}
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
              {!searchImgResArr[imgId] &&
                <Button mode="secondary" stretched before={searchSpinner[imgId] ? <Spinner size="regular"/> : <Icon24SearchStarsOutline />} onClick={() => {throttledFetchSearchImage(img.imgMaxResolution.url, img.id)}}>
                  {"Поиск"}
                </Button>
              }
              {searchImgResArr[imgId] && (searchImgResArr[imgId].results.some(item => item.match === ("best" || "additional")) ? (
                  searchImgResArr[imgId].results.map((result, index) => {
                    return (
                      <React.Fragment key={index}>
                        <Separator />
                        <RichCell
                            before={<VKImage 
                              size={96} 
                              src={result.thumbnail.fixedSrc} 
                              alt="Image" 
                              borderRadius="s"
                            ></VKImage>}
                          subhead={`совпадение: ${result.similarity}%`}
                          caption={
                            result.thumbnail?.tags && <Caption style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{`Теги: ${result.thumbnail?.tags?.map((tag) => `${tag}`).join(', ')}`}</Caption>}
                          actions={
                            <ButtonGroup mode="horizontal" gap="s" stretched>
                              {result.sources.map((source, sIndex) => {
                                return (
                                  <Button 
                                    mode="primary" 
                                    size="s" 
                                    onClick={() => {window.open(source.fixedHref, '_blank')}} 
                                    before={(source.service != "Anime-Pictures" && source.service != "Zerochan" && source.service != "e-shuushuu") && <Caption level="2" weight="3">vpn!</Caption>} 
                                    after={<Icon12ArrowUpRightOutSquareOutline />}
                                    key={sIndex}>
                                      {source.service}
                                  </Button>
                              )})}
                            </ButtonGroup>
                          }
                        >
                          {`${result.width}x${result.height}`}
                        </RichCell>
                      </React.Fragment>
                  )})
                ) : (
                  <ButtonGroup stretched align="right" gap="m">
                    <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[imgId].otherSearchHrefs.google, '_blank')}} key="google">google</Button>
                    <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[imgId].otherSearchHrefs.saucenao, '_blank')}} key="saucenao">saucenao</Button>
                    <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[imgId].otherSearchHrefs.tineye, '_blank')}} key="tineye">tineye</Button>
                  </ButtonGroup>
                ))
              }
            </Group>
        )})}
      { !error && albumsImages?.length > 0 && <Group>
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}><Pagination
          currentPage={currentPage}
          siblingCount={siblingCount}
          boundaryCount={boundaryCount}
          totalPages={totalPages}
          disabled={false}
          onChange={handleChange}
        /></div>
      </Group>}
    </Panel>
  );
};
SearchOriginal.propTypes = {
    id: PropTypes.string.isRequired,
};