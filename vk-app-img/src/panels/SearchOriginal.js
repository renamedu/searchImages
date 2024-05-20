import { Panel, PanelHeader, PanelHeaderBack, Group, RichCell, ButtonGroup, Button, Header, Pagination, Div, Spinner, Separator, Banner, Avatar, Subhead, Link, Popover, Search, Caption } from '@vkontakte/vkui';
import {Image as VKImage} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import React, { useEffect, useState, useCallback } from "react";
import { Icon36Delete, Icon28CheckCircleFill, Icon28CancelCircleFillRed, Icon48Block, Icon12ArrowUpRightOutSquareOutline, Icon16Link, Icon16InfoOutline, Icon24Done, Icon24User, Icon24SearchStarsOutline } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import { AddImgMaxRes } from '../service/AddImgMaxRes';
import { useMetaParams } from '@vkontakte/vk-mini-apps-router';

export const SearchOriginal = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const params = useMetaParams();
  const album = params?.item;
  const user = params?.fetchedUser;
  const token = params?.vkUserAuthToken;

  const [albumsImages, setAlbumsImages] = useState(null);
  const photosCount = (album?.size > 1000) ? 1000 : album?.size;
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [siblingCount, setSiblingCount] = useState(1);
  const [boundaryCount, setBoundaryCount] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [addCounter, setAddCounter] = useState(0);
  const [addLimit, setaddLimit] = useState(9);
  function addCalc() {
    let counter = addCounter + 1
    setAddCounter(counter);
    if (addCounter == 9) {
      setaddLimit(Math.ceil(Math.random() * 9))
    }
    if (addCounter == (9 + addLimit)) {
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
              .catch((error) => { console.log(error); });
          }
        })
        .catch((error) => { console.log(error); });
      setAddCounter(0);
    }
  }

  const itemsPerPage = 50; // Number of items per page (added line)
  const handleChange = React.useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

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
          // offset: offset,
        },
      });
      return albumsImages;
    }
    fetchAlbumsImages()
      .then((albumsImages) => {
        albumsImages.response.items.map((img) => {AddImgMaxRes(img)});
        setAlbumsImages(albumsImages.response.items);
        setTotalPages(Math.ceil(albumsImages.response.items.length/50))
      })
      .catch(error => {
        setError(1);
      });
  }, []);
  // albumsImages && console.log(albumsImages)

  function setAlbumNum(albumId) {
    let trueNum = albumId;
    if (albumId == "-15") {
      trueNum = "000"
    } else if (albumId == "-7") {
      trueNum = "00"
    } else if (albumId == "-6") {
      trueNum = "0"
    }
    return trueNum
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = albumsImages?.slice(startIndex, endIndex);

  const [searchImgResArr, setSearchImgResArr] = useState({});
  const [searchSpinner, setSearchSpinner] = useState({});

  async function fetchSearchImage(imgUrl, imgId) {
    setSearchSpinner((prevState) => ({ ...prevState, [imgId]: true }))
    addCalc();
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
      const response = await fetch('http://localhost:3000/image-search', requestOptions);
      const searchImageResult = await response.json()
      setSearchImgResArr((prevState) => ({ ...prevState, [imgId]: searchImageResult.searchImageResult }))
    } catch (error) {
      console.log(error)
    } finally {
      setSearchSpinner((prevState) => ({ ...prevState, [imgId]: false }));
    }
  }
  // searchImgResArr && console.log(searchImgResArr)

  return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.replace('/')} />}>
          SearchOriginal
        </PanelHeader>
        <Group header={<Header 
          mode="primary"
          indicator={!error && (photosCount < 1000 ? photosCount :
            <Popover
              trigger={['click', 'hover', 'focus']}
              placement="right"
              role="tooltip"
              aria-describedby="tooltip-3"
              content={
                <Caption>
                  Колличевство изображений ограничено 1000, вследствие ограничений вк.
                </Caption>
              }
            >
                <Icon16InfoOutline />
            </Popover>)
          }
          >
            {album?.title}
          </Header>}>
          {error && 
          <Banner
          before={
            <Icon28CancelCircleFillRed />
          }
          header="Ошибка загрузки :("
          subheader={
            <React.Fragment>
              Попробуйте перезайти в альбом или перезагрузить приложение
            </React.Fragment>
          }/>}
          { !error && <Pagination
            currentPage={currentPage}
            siblingCount={siblingCount}
            boundaryCount={boundaryCount}
            totalPages={totalPages}
            disabled={false}
            onChange={handleChange}
          />}
        </Group>
        { !error && currentItems?.map((img, index) => {
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
                  onClick={() => {
                    bridge.send('VKWebAppShowImages',{
                    images: [img.imgMaxResolution.url]
                  })}}
                ></VKImage>}
                after={`${index + 1 + startIndex} из ${albumsImages.length}`}
                text={`${img.imgMaxResolution.width}x${img.imgMaxResolution.height}`}
                actions={
                  <ButtonGroup mode="horizontal" gap="s" stretched>
                    <Link href={`https://vk.com/album${user?.id}_${setAlbumNum(album?.id)}?z=photo${user?.id}_${img.id}%2Falbum${user?.id}_${setAlbumNum(album?.id)}%2Frev`} target="_blank">
                      Фото в альбоме <Icon16Link />
                    </Link>
                  </ButtonGroup>
                }
              >
                {date.toLocaleDateString()}
              </RichCell>
              {!searchImgResArr[imgId] &&
                <Button mode="secondary" stretched before={searchSpinner[imgId] ? <Spinner size="regular"/> : <Icon24SearchStarsOutline />} onClick={() => {fetchSearchImage(img.imgMaxResolution.url, img.id)}}>
                  {"Поиск"}
                </Button>
              }
              {searchImgResArr[imgId]
                && (searchImgResArr[imgId].results.some(item => item.match === ("best" || "additional")) ? (
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
                            <Caption style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{`Теги: ${result.thumbnail?.tags?.map((tag) => `${tag}`).join(', ')}`}</Caption>}
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
                  <ButtonGroup stretched>
                    <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[imgId].otherSearchHrefs.ascii2d, '_blank')}} key="ascii2d">ascii2d</Button>
                    <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[imgId].otherSearchHrefs.google, '_blank')}} key="google">google</Button>
                    <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[imgId].otherSearchHrefs.saucenao, '_blank')}} key="saucenao">saucenao</Button>
                    <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[imgId].otherSearchHrefs.tineye, '_blank')}} key="tineye">tineye</Button>
                  </ButtonGroup>
                ))
              }
            </Group>
        )})}
      { !error && <Group>
        <Pagination
          currentPage={currentPage}
          siblingCount={siblingCount}
          boundaryCount={boundaryCount}
          totalPages={totalPages}
          disabled={false}
          onChange={handleChange}
        />
      </Group>}
    </Panel>
  );
};

SearchOriginal.propTypes = {
    id: PropTypes.string.isRequired,
};