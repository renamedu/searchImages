import bridge from '@vkontakte/vk-bridge';

export default async function fetchUserAlbums() {
    const vkUserAlbums = await bridge.send('VKWebAppCallAPIMethod', {
      method: 'photos.getAlbums',
      params: {
        owner_id: 444800585,
        v: '5.131',
        access_token: "vk1.a.xljeVndtR09A5s_huz1vl5yh3L5H252DY1YFSI1tNOuZNBcfNRQeF3vGOxnGLqqmoaWfnb1iQ9puaKpRegf9-DzD8tvmBeuYnvdwPd6MKCjoIi17WztAaSipg-YKC9p9kkQUJbyLvd0Mwkhtt9bHDmiZwH3Kg32fRHGFdqjOE",
        need_covers: 1,
      }
    })
    return vkUserAlbums;
  }

  const BackendPHPUrl = "http://localhost/php_vk/api.php";

  const sendData = async(url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error adress ${url}, status ${response}`);
    }
    return await response.json();
  }

  sendData(BackendPHPUrl, vkUserAuthToken).then((data) => setResponseData(data));