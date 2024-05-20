import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, Alert, ScreenSpinner, useAdaptivityConditionalRender } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

import { SearchCopy, Home, SearchOriginal } from './panels';
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
  const [fetchedUser, setUser] = useState();
  const [popout, setPopout] = useState(<ScreenSpinner size="large" />);
  const [alertPopout, setAlertPopout] = useState(null);

  // const showAlert = (callback) => {
  //   setAlertPopout(
  //     <Alert
  //       actions={[{
  //         title: 'Cancel',
  //         autoclose: 'true',
  //         mode: 'cancel',
  //       }, {
  //         title: 'Delete',
  //         autoclose: 'true',
  //         mode: 'destructive',
  //         action: callback,
  //       }]}
  //       onClose={() => setAlertPopout(null)}
  //     >
  //       <h2>Вы уверены что хотите удалить это изображение?</h2>
  //       <p>Это действие необратимо</p>
  //     </Alert>
  //   );
  // };

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUser(user);
      setPopout(null);
    }
    fetchData();
  }, []);

  return (
    <SplitLayout popout={popout || alertPopout}>
      <SplitCol>
        <View activePanel={activePanel}>
          <Home id="home" fetchedUser={fetchedUser} />
          <SearchCopy id="searchCopy"/>
          <SearchOriginal id="searchOriginal" />
        </View>
      </SplitCol>
    </SplitLayout>
  );
};
