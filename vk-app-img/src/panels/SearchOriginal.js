import { Panel, PanelHeader, PanelHeaderBack, Group, RichCell, ButtonGroup, Button, Header, Pagination, FormLayoutGroup, Spinner, Separator, Banner, FormItem, Subhead, Link, Avatar, Search, Caption, FixedLayout, Div } from '@vkontakte/vkui';
import {Image as VKImage} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import React, { useEffect, useState } from "react";
import { Icon36Delete, Icon16ChevronUpCircle, Icon28CancelCircleFillRed, Icon48Block, Icon12ArrowUpRightOutSquareOutline, Icon16Link, Icon16InfoOutline, Icon24Done, Icon24User, Icon24SearchStarsOutline } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import { AddImgMaxRes } from '../service/AddImgMaxRes';
import { useMetaParams } from '@vkontakte/vk-mini-apps-router';
import { setOffsetAccPage } from '../service/SetOffsetAccPage';
import { setAlbumNum } from '../service/SetAlbumNum';
import { useSearchParams } from '@vkontakte/vk-mini-apps-router';
import axios from 'axios';
import { getAlbumPhotos } from '../service/FetchAlbumsPhotos';
import ScrollToTopButton from '../components/ScrollToTopButton';
import OtherSearchLinks from '../components/OtherSearchLinks';
import ErrorBanner from '../components/ErrorBanner';
import { checkAndShowAds } from '../service/CheckAndShowAds';

export const SearchOriginal = ({ id, fetchedUser, vkUserAuthToken, originalAlbumId }) => {
  const routeNavigator = useRouteNavigator();

  const [params, setParams] = useSearchParams();
  const albumId = params.get('albumId')
  const albumTitle = params.get('title')
  const albumSize = params.get('size')

  const [albumsImages, setAlbumsImages] = useState(null);
  const [loadingAlbumsImages, setLoadingAlbumsImages] = useState(null);
  const [error, setError] = useState(null);
  const warningGradient = 'linear-gradient(90deg, #ffb73d 0%, #ffa000 100%)';
  const [userReg, setUserReg] = useState(null);

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
    checkAndShowAds();
  }, []);

  useEffect(() => {
    setLoadingAlbumsImages(1);
    if (vkUserAuthToken) {
      const fetchAndSetAlbumsImages = async () => {
        try {
          const albumsImages = await getAlbumPhotos(fetchedUser?.id, albumId, vkUserAuthToken?.access_token, 1000, offset);
          albumsImages.response.items.forEach(AddImgMaxRes);
          setAlbumsImages(albumsImages.response.items);
          setLoadingAlbumsImages(null);
          setError(null);
        } catch (error) {
          setError(1);
          console.error(error);
        }
      };
      fetchAndSetAlbumsImages();
    }
  }, [offset, vkUserAuthToken]);

  const startIndex = ((currentPage - 1) * itemsPerPage) - offset;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = albumsImages?.slice(startIndex, endIndex);

  const [searchImgResArr, setSearchImgResArr] = useState({});
  const [searchSpinner, setSearchSpinner] = useState({});

  const [fetchSearchTimesArr, setFetchSearchTimesArr] = useState([Date.now()]);
  const [AddWaiting, setAddWaiting] = useState(false)

  async function handleSearchButtonClick(imgUrl, imgId) {
    let nowTime = Date.now();
    if (fetchSearchTimesArr.length < 3) {
      fetchSearchImage(imgUrl, imgId)
    } else {
      if (nowTime - fetchSearchTimesArr[fetchSearchTimesArr.length - 3] > 6000) {
        fetchSearchImage(imgUrl, imgId)
      } else {
        checkAndShowAds();
        setAddWaiting(true)
        setTimeout(() => {setAddWaiting(false)}, 4900);
      }
      setFetchSearchTimesArr((prevState) => prevState.slice(1));
    }
    setFetchSearchTimesArr((prevState) => [ ...prevState, nowTime ]);
  }

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
      if (!userReg) {
          try {
          const response = await axios.get('https://ipinfo.io/json');
          setUserReg(response.data.country);
        } catch (error) {
          console.error('Region location error:', error);
        }
      }
      const response = await fetch('https://app51674008.ru', requestOptions);
      const searchImageResult = await response.json()
      setSearchImgResArr((prevState) => ({ ...prevState, [imgId]: searchImageResult.searchImageResult }))
    } catch (error) {
      console.log(error)
    } finally {
      setSearchSpinner((prevState) => ({ ...prevState, [imgId]: false }));
    }
  }

  return (
      <Panel id={id}>
        <ScrollToTopButton />
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.replace('/albums')} />}>
          Поиск оригиналов
        </PanelHeader>
        <Group header={<Header mode="primary" indicator={albumSize}>{albumTitle}</Header>}>
          {error && <ErrorBanner />}
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
                <input 
                  type="number" 
                  width="auto" 
                  min="1" 
                  max={totalPages} 
                  value={searchPageNumber}
                  onChange={
                    (e) => {const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setSearchPageNumber(value);
                    }}
                  }
                />
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
                subhead={date.toLocaleDateString()}
                after={`${index + 1 + ((currentPage - 1) * itemsPerPage)} из ${albumSize}`}
                actions={
                  <ButtonGroup mode="horizontal" gap="s" stretched>
                    <Link href={`https://vk.com/album${fetchedUser?.id}_${setAlbumNum(albumId)}?z=photo${fetchedUser?.id}_${img.id}%2Falbum${fetchedUser?.id}_${setAlbumNum(albumId)}%2Frev`} target="_blank">
                      Фото в альбоме <Icon16Link />
                    </Link>
                  </ButtonGroup>
                }
              >
                {`${img.imgMaxResolution.width}x${img.imgMaxResolution.height}`}
              </RichCell>
              {!searchImgResArr[imgId] &&
                <Button 
                  mode="secondary"
                  stretched 
                  disabled = { AddWaiting && true }
                  before={searchSpinner[imgId] ? <Spinner size="regular"/> : <Icon24SearchStarsOutline />} 
                  onClick={() => {
                    handleSearchButtonClick(img.imgMaxResolution.url, img.id)
                  }}
                >
                  {"Поиск"}
                </Button>
              }
              {searchImgResArr[imgId] && (
                <>
                  {searchImgResArr[imgId].results.some(item => item.match === "best" || item.match === "additional") && 
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
                            text={result.thumbnail?.tags && <Caption style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{`Теги: ${result.thumbnail?.tags?.map((tag) => `${tag}`).join(', ')}`}</Caption>}
                            caption={(result.sources[0].service != "Anime-Pictures" && result.sources[0].service != "Zerochan" && result.sources[0].service != "e-shuushuu") 
                              && (!userReg || userReg == "RU") && <Banner
                                style={{ padding: '2px' }}
                                before={
                                  <Avatar size={16} style={{ backgroundImage: warningGradient }}>
                                    <span style={{ color: '#fff' }}>!</span>
                                  </Avatar>
                                }
                                text={
                                  <Caption level="1" style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                    {`Недоступен переход по запрещенным в РФ ресурсам (${result.sources[0].service == "Danbooru" ? result.sources[0].service+"/Gelbooru" : result.sources[0].service})`}
                                  </Caption>
                            }/>}
                            actions={
                              <ButtonGroup mode="horizontal" gap="s" stretched>
                                {result.sources.map((source, sIndex) => {
                                  return (
                                    <Link href={source.fixedHref} target="_blank" style={{ textDecoration: 'none' }} key={sIndex}>
                                      <Button 
                                        mode="primary" 
                                        size="s"
                                        disabled={(source.service != "Anime-Pictures" && source.service != "Zerochan" && source.service != "e-shuushuu") && (!userReg || userReg == "RU") && true}
                                        after={<Icon12ArrowUpRightOutSquareOutline />}
                                        >
                                          {source.service}
                                      </Button>
                                    </Link>
                                )})}
                              </ButtonGroup>
                            }
                          >
                            {`${result.width}x${result.height}`}
                          </RichCell>
                        </React.Fragment>
                  )})}
                  <Separator />
                  <OtherSearchLinks imgId={imgId} searchImgResArr={searchImgResArr} />
                </>
              )}
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