import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, Alert, ScreenSpinner, useAdaptivityConditionalRender } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

import { SearchCopy, Home, SearchOriginal, Albums } from './panels';
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
  const [fetchedUser, setUser] = useState();
  const [popout, setPopout] = useState(<ScreenSpinner size="large" />);
  const [alertPopout, setAlertPopout] = useState(null);
  const [vkUserAuthToken, setVkUserAuthToken] = useState(null);
  const [userLaunchParams, setUserLaunchParams] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUser(user);
      setPopout(null);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchLaunchParams() {
      const userLaunchParams = await bridge.send('VKWebAppGetLaunchParams');
      setUserLaunchParams(userLaunchParams);
    }
    fetchLaunchParams();
  }, []);

  // console.log(userLaunchParams?.vk_platform)

  useEffect(() => {
    if (userLaunchParams?.vk_access_token_settings == "photos") {
      async function fetchUserToken() {
        const vkUserAuthToken = await bridge.send("VKWebAppGetAuthToken", {
          app_id: 51674008,
          scope: "photos",
        });
        setVkUserAuthToken(vkUserAuthToken);
      }
      fetchUserToken();
    }
  }, [userLaunchParams]);

  return (
    <SplitLayout popout={popout || alertPopout}>
      <SplitCol>
        <View activePanel={activePanel}>
          <Home id="home" fetchedUser={fetchedUser} setVkUserAuthToken={setVkUserAuthToken} vkUserAuthToken={vkUserAuthToken}/>
          <Albums id="albums" fetchedUser={fetchedUser} vkUserAuthToken={vkUserAuthToken} />
          <SearchCopy id="searchCopy" fetchedUser={fetchedUser} vkUserAuthToken={vkUserAuthToken} />
          <SearchOriginal id="searchOriginal" fetchedUser={fetchedUser} vkUserAuthToken={vkUserAuthToken} />
        </View>
      </SplitCol>
    </SplitLayout>
  );
};
