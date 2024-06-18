import { Panel, PanelHeader, Header, Button, Group, FormItem, Div, File, Banner, Avatar, ButtonGroup, RichCell, Accordion, Subhead, Footnote, Spinner, Caption, Separator } from '@vkontakte/vkui';
import { Icon20InfoCircleOutline, Icon24PictureOutline, Icon24SearchStarsOutline, Icon12ArrowUpRightOutSquareOutline, Icon36Users3Outline } from '@vkontakte/icons';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import bridge from '@vkontakte/vk-bridge';
import {Image as VKImage} from '@vkontakte/vkui';
import { throttle } from 'lodash';
import preview1 from '../images/preview1.jpg';
import preview2 from '../images/preview2.jpg';
import preview3 from '../images/preview3.jpg';
import axios from 'axios';

import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export const Home = ({ id, fetchedUser, setVkUserAuthToken, vkUserAuthToken }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const warningGradient = 'linear-gradient(90deg, #ffb73d 0%, #ffa000 100%)';

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [limitFiles, setLimitFiles] = useState(null);
  const [searchSpinner, setSearchSpinner] = useState({});
  const [searchImgResArr, setSearchImgResArr] = useState({});
  const [base64Images, setBase64Images] = useState(null);
  const [notImageAlert, setNotImageAlert] = useState(null);
  const [userReg, setUserReg] = useState(null);
  
  useEffect(() => {
    const previews = [preview1, preview2, preview3]
    async function toBase64(url) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error converting image to base64:', error);
        throw error;
      }
    }
    async function checkOnboardingStatus() {
      try {
        const storageData = await bridge.send('VKWebAppStorageGet', { keys: ['onboarding_status'] });
        const onboardingStatus = storageData.keys[0]?.value;
        // console.log('Onboarding status:', onboardingStatus);

        if (onboardingStatus !== 'completed') {
          if (previews && previews.length > 0) {
            const base64Images = await Promise.all(previews.map(preview => toBase64(preview)));
            setBase64Images(base64Images);
            showOnboarding(base64Images);
          } else {
            console.error('Preview URL is not provided.');
          }
        }
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      }
    }
    checkOnboardingStatus();
  }, []);

  const showOnboarding = (base64Images) => {
    if (!base64Images || base64Images.length === 0) {
      console.error('Base64 images array is empty or null');
      return;
    }
    bridge.send('VKWebAppShowSlidesSheet', {
      slides: [
        {
          media: {
            blob: base64Images[0],
            type: 'image'
          },
          title: 'Находите оригиналы изображений',
          subtitle: 'Вы получите размеры подлинников, теги и ссылки на ресурсы с этими изображениями. Если изображения нет, возможно искать через Google, SauceNAO и TinEye.',
        },
        {
          media: {
            blob: base64Images[1],
            type: 'image'
          },
          title: 'Поиск оригиналов картинок в ваших альбомах...',
          subtitle: 'Возможно осуществить поиск без необходимости загружать изображения с устройства. Для этого перейдите к вашим альбомам',
        },
        {
          media: {
            blob: base64Images[2],
            type: 'image'
          },
          title: 'А также поиск копий в альбомах',
          subtitle: 'В ваших альбомах вы можете найди копии фото или искать оригиналы каждого изображения',
        },
      ]
    }).then(() => {
      bridge.send('VKWebAppStorageSet', {
        key: 'onboarding_status',
        value: 'completed'
      });
    }).catch((error) => {
      console.error('Error showing onboarding:', error);
    });
  };

  const handleFileChange = (e) => {
    setNotImageAlert(null);
    setLimitFiles(null);
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setNotImageAlert(1);
      return;
    }
    if (files.length > 20) {
      setLimitFiles(1);
    } else if (files.length > 10) {
      (Math.random() < 0.5) && bridge.send('VKWebAppCheckNativeAds', {
        ad_format: 'interstitial'
      }).then((data) => { 
        if (data.result) { 
          bridge.send('VKWebAppShowNativeAds', {
            ad_format: 'interstitial'
          }).then( (data) => { 
            if (data.result) {}
          }).catch((error) => { console.log(error) });
        }
      }).catch((error) => { console.log(error) });
      setSelectedFiles(files);
    } else {
      setSelectedFiles(files);
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = selectedFiles.map((file) => {
        return new Promise((resolve) => {

        const readerArrayBuffer = new FileReader();
        const readerDataURL = new FileReader();

        readerArrayBuffer.onload = (e) => {
          const arrayBuffer = e.target.result;
          
          readerDataURL.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              resolve({
                src: e.target.result,
                arrayBuffer: arrayBuffer,
                width: img.width,
                height: img.height,
                id: file.lastModified,
              });
            };
            img.src = e.target.result;
          };
          readerDataURL.readAsDataURL(file);
        };
        readerArrayBuffer.readAsArrayBuffer(file);
      });
    });
      const loadedImages = await Promise.all(imagePromises);
      setImages(loadedImages);
    };
    if (selectedFiles?.length > 0) {
      loadImages();
    }
  }, [selectedFiles]);

  const throttledFetchSearchImage = throttle(
    async function fetchSearchImage(arrayBuffer, imgId) {
      setSearchSpinner((prevState) => ({ ...prevState, [imgId]: true }))
      try {
        const uint8Array = new Uint8Array(arrayBuffer);
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imgData: Array.from(uint8Array),
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
  }, 1000);

  const handleButtonClick = async () => {
    if (!vkUserAuthToken) {
      const vkUserAuthToken = await bridge.send("VKWebAppGetAuthToken", {
        app_id: 51674008,
        scope: "photos",
      });
      setVkUserAuthToken(vkUserAuthToken);
    }
    routeNavigator.push('albums');
  };

  return (
    <Panel id={id}>
      <PanelHeader>Поиск картинок</PanelHeader>
      <Group>
        <Accordion>
          <Accordion.Summary style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Icon20InfoCircleOutline style={{ marginRight: '8px' }} />
              <span>О приложении</span>
            </div>
          </Accordion.Summary>
          <Accordion.Content>
            <Div>
            <Subhead>
              На главной странице вы можете загрузить свои изображения для поиска подлинников. Также возможно искать оригиналы среди ваших изображений в альбомах. Для каждого альбома доступны две опции: поиск копий и поиск оригиналов изображений.
            </Subhead>
            <Subhead>Поиск копий изображений:</Subhead>
            <Footnote>
              • Позволяет находить копии в выбранном альбоме.
              <br />
              • Отображает изображения с датой загрузки и размером, а также процентом сходства.
              <br />
              • Возможность просматривать найденные копии в приложении и в альбоме.
            </Footnote>
            <br />
            <Subhead>Поиск оригиналов изображений:</Subhead>
            <Footnote>
              • Ищет оригиналы изображений из альбома, по сервисам картинок (Danbooru, Anime-Pictures, e-shuushuu и др.).
              <br />
              • Если картинки нет в сервисах, будет предложено найти в Google, SauceNAO и TinEye.
              <br />
              • Результаты поиска возможно открыть во вкладках браузера.
            </Footnote>
            </Div>
          </Accordion.Content>
        </Accordion>
      </Group>

      <Group>
        <FormItem top="Загрузите ваше изображение">
          <File
            before={<Icon24PictureOutline/>}
            size="m"
            multiple
            accept=".png,.jpg,.jpeg,.gif"
            onChange={handleFileChange}
          >
            Открыть галерею
          </File>
        </FormItem>
        {limitFiles && <Banner
          before={
            <Avatar size={28} style={{ backgroundImage: warningGradient }}>
              <span style={{ color: '#fff' }}>!</span>
            </Avatar>
          }
          header="Выбрано более 20 изображений!"
        />}
        {notImageAlert && <Banner
          before={
            <Avatar size={28} style={{ backgroundImage: warningGradient }}>
              <span style={{ color: '#fff' }}>!</span>
            </Avatar>
          }
          header="Вы можете выбирать только изображения(jpg, jpeg, png, gif)!"
        />}
      </Group>
      { images?.length > 0 && images?.map((img, index) => {
      if (searchSpinner[img.id] === undefined) {
        setSearchSpinner((prevState) => ({ ...prevState, [img.id]: false }));
      }
      return (
        <Group key={index}>
          <RichCell
            key={index}
            before={<VKImage 
              size={96} 
              src={img.src}
              alt="Image" 
              borderRadius="s" 
            ></VKImage>}
            after={`${index + 1} из ${images?.length}`}
          >
            {`${img.width}x${img.height}`}
          </RichCell>
          {!searchImgResArr[img.id] &&
            <Button mode="secondary" stretched before={searchSpinner[img.id] ? <Spinner size="regular"/> : <Icon24SearchStarsOutline />} onClick={() => {throttledFetchSearchImage(img.arrayBuffer, img.id)}}>
              {"Поиск"}
            </Button>
          }
          {searchImgResArr[img.id] && (
            <>
            {searchImgResArr[img.id].results.some(item => item.match === "best" || item.match === "additional") &&
              searchImgResArr[img.id].results.map((result, index) => {
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
                              <Button 
                                mode="primary" 
                                size="s" 
                                onClick={() => {window.open(source.fixedHref, '_blank')}}
                                disabled={(source.service != "Anime-Pictures" && source.service != "Zerochan" && source.service != "e-shuushuu") && (!userReg || userReg == "RU") && true}
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
              )})}
              <Separator />
              <ButtonGroup stretched align="right" gap="m" style={{ marginTop: '8px' }}>
                <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[img.id].otherSearchHrefs.google, '_blank')}} key="google">google</Button>
                <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[img.id].otherSearchHrefs.saucenao, '_blank')}} key="saucenao">saucenao</Button>
                <Button mode="primary" size="s" onClick={() => {window.open(searchImgResArr[img.id].otherSearchHrefs.tineye, '_blank')}} key="tineye">tineye</Button>
              </ButtonGroup>
            </>
            )}
        </Group>
      )})}
      <Group header={<Header>Копии и оригиналы картинок в альбомах</Header>}>
        <ButtonGroup mode="vertical" gap="m" stretched>
          <Button onClick={handleButtonClick} size="l" appearance="accent" stretched>
            Открыть Мои альбомы
          </Button>
        </ButtonGroup>
      </Group>
    </Panel>
  );
};

Home.propTypes = {
  id: PropTypes.string.isRequired,
  fetchedUser: PropTypes.shape({
    photo_200: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    city: PropTypes.shape({
      title: PropTypes.string,
    }),
  }),
};
