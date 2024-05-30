import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar, IconButton, Image, ButtonGroup, RichCell, Accordion, Subhead, Footnote } from '@vkontakte/vkui';
import { Icon20InfoCircleOutline, Icon56Users3Outline, Icon56SearchOutline, Icon36NftHeptagonOutline, Icon36Users3Outline } from '@vkontakte/icons';
import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import bridge from '@vkontakte/vk-bridge';

import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export const Home = ({ id, fetchedUser }) => {

  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const [vkUserAuthToken, setVkUserAuthToken] = useState(null);
  const [vkUserAlbums, setVkUserAlbums] = useState(null);
  
  useEffect(() => {
    async function fetchUserToken() {
      const vkUserAuthToken = await bridge.send("VKWebAppGetAuthToken", {
        app_id: 51674008,
        scope: "photos",
      });
      setVkUserAuthToken(vkUserAuthToken);
    }
    fetchUserToken().then((response) => {})
    .catch(er => {
      console.log(er);
    });
  }, []);
  
  useEffect(() => {
    if (vkUserAuthToken && fetchedUser) {
      async function fetchUserAlbums() {
        const vkUserAlbums = await bridge.send("VKWebAppCallAPIMethod", {
          method: "photos.getAlbums",
          params: {
            access_token: vkUserAuthToken.access_token,
            owner_id: fetchedUser.id,
            need_system: "1",
            need_covers: "1",
            v: "5.131",
            // photo_sizes: "1",
          },
        });
        return vkUserAlbums
        // setVkUserAlbums(vkUserAlbums.response.items);
      }
      fetchUserAlbums().then((vkUserAlbums) => {setVkUserAlbums(vkUserAlbums.response.items)})
      .catch(er => {
        console.log(er);
      });
    }
  }, [vkUserAuthToken, fetchedUser]);
  
  // vkUserAuthToken && console.log(vkUserAuthToken);
  // vkUserAlbums && console.log(vkUserAlbums);

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
            <Subhead>На главной странице находятся ваши альбомы с миниатюрами и количеством изображений. Для каждого альбома доступны две опции: поиск копий и поиск оригиналов изображений.</Subhead>
            <br />
            <Subhead>Поиск копий изображений:</Subhead>
            <br />
            <Footnote>
              • Позволяет находить копии в выбранном альбоме.
              <br />
              • Отображает изображения с датой загрузки и размером, а также процентом сходства.
              <br />
              • Возможность просматривать найденные копии в приложении и в альбоме.
            </Footnote>
            <br />
            <Subhead>Поиск оригиналов изображений:</Subhead>
            <br />
            <Footnote>
              • Ищет оригиналы изображений из альбома, по сервисам картинок (Danbooru, Konachan, e-shuushuu и др.).
              <br />
              • Если картинки нет в сервисах, будет предложено найти в Google, SauceNAO и TinEye.
              <br />
              • Результаты поиска возможно открыть во вкладках браузера (не открываются через приложение ВК).
            </Footnote>
            </Div>
          </Accordion.Content>
        </Accordion>
      </Group>

      {vkUserAlbums && <Group header={<Header 
        mode="primary"
        indicator={vkUserAlbums?.length || 0}
        >
          Мои альбомы
        </Header>}>
        {vkUserAlbums?.map((item, index) => {
          return <RichCell
            key={index}
            before={<Image size={96} src={item.thumb_src} alt="Обложка" borderRadius="s"/>}
            caption={item.size}
            actions={
              <ButtonGroup mode="horizontal" gap="s" stretched>
                <Button mode="secondary" size="l" onClick={() => routeNavigator.push('searchCopy', {state: {item, fetchedUser, vkUserAuthToken}})}>
                  Копии
                </Button>
                <Button mode="secondary" size="l" onClick={() => routeNavigator.push('searchOriginal', {state: {item, fetchedUser, vkUserAuthToken}})}>
                  Оригиналы
                </Button>
              </ButtonGroup>
            }
          >
            {item.title}
          </RichCell>
        })}
      </Group>}
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
