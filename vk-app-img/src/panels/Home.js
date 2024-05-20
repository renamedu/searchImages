import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar, IconButton, Image, ButtonGroup, RichCell } from '@vkontakte/vkui';
import { Icon28MessageOutline, Icon56Users3Outline, Icon56SearchOutline, Icon36NftHeptagonOutline, Icon36Users3Outline } from '@vkontakte/icons';
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
  }, [vkUserAuthToken]);
  
  // vkUserAuthToken && console.log(vkUserAuthToken);
  // vkUserAlbums && console.log(vkUserAlbums);

  return (
    <Panel id={id}>
      <PanelHeader>Поиск изображений</PanelHeader>
      {fetchedUser && (
        <Group>
          <Cell before={photo_200 && <Avatar src={photo_200} />} subtitle={city?.title}>
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}

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
