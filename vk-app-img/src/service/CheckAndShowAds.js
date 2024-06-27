import bridge from '@vkontakte/vk-bridge';

export const checkAndShowAds = async () => {
    try {
      const checkAd = await bridge.send('VKWebAppCheckNativeAds', {
        ad_format: 'interstitial'
      });
      if (checkAd.result) {
        const showAd = await bridge.send('VKWebAppShowNativeAds', {
          ad_format: 'interstitial'
        });
        if (showAd.result) {}
      }
    } catch (error) {
      console.log(error);
    }
};