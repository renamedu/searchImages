import bridge from '@vkontakte/vk-bridge';

export function getAlbumPhotos(owner_id, album_id, access_token, count, offset) {
    return bridge.send("VKWebAppCallAPIMethod", {
      method: "photos.get",
      params: {
        owner_id: owner_id,
        album_id: album_id,
        access_token: access_token,
        v: "5.131",
        count: count,
        rev: 1,
        offset: offset,
      },
    });
}