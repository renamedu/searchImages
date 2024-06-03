import { Panel, PanelHeader, Header, Button, Group, PanelHeaderBack, Div, Avatar, IconButton, Image, ButtonGroup, RichCell, Accordion, Subhead, Footnote } from '@vkontakte/vkui';
import { Icon20InfoCircleOutline, Icon56Users3Outline, Icon56SearchOutline, Icon36NftHeptagonOutline, Icon36Users3Outline } from '@vkontakte/icons';
import { useEffect, useState } from "react";
import bridge from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useMetaParams } from '@vkontakte/vk-mini-apps-router';

export const Albums = ({ id }) => {
    const routeNavigator = useRouteNavigator();
    const [vkUserAlbums, setVkUserAlbums] = useState(null);
    const params = useMetaParams();
    const fetchedUser = params?.fetchedUser;
    const vkUserAuthToken = params?.vkUserAuthToken;
      
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
            },
        });
        return vkUserAlbums
        }
        fetchUserAlbums().then((vkUserAlbums) => {setVkUserAlbums(vkUserAlbums.response.items)})
        .catch(er => {
        console.log(er);
        });
    }
    }, [vkUserAuthToken, fetchedUser]);

    return (
    <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.replace('/')} />}>
            Альбомы
        </PanelHeader>
        {vkUserAlbums && <Group header={<Header 
        mode="primary"
        indicator={vkUserAlbums?.length || 0}
        >
            Мои альбомы
        </Header>}>
        {vkUserAlbums?.map((item, index) => {
            if (item.id != -9000) {
                return (<RichCell
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
                </RichCell>)
            }
        })}
        </Group>}
    </Panel>
    );
};