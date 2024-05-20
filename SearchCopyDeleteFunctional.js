  
  
// async function deletePhotoFromVK(id) {
//   const response = await bridge.send("VKWebAppCallAPIMethod", {
//     method: "photos.delete",
//     params: {
//       owner_id: user?.id,
//       photo_id: id,
//       access_token: token?.access_token,
//       v: "5.199",
//     },
//   });
//   return response.json();
// }
// const [deletedImages, setDeletedImages] = useState({});
// const deletePhoto = function(id) {
//   deletePhotoFromVK(id).then((response) => {response ?? console.log(`Delete ${id} photo`)}).catch((er) => {console.log(er)})
//   setDeletedImages((prevState) => ({ ...prevState, [id]: true }));
// }
// const handleDeleteClick = (index) => {
//   showAlert(() => deletePhoto(index));
// };

// const isDeleted = !!deletedImages[img.id];

//   onClick={() => {/* !isDeleted && */ showImages(imgPreviewUrls)}}

                {/* {isDeleted && <VKImage.Overlay theme="dark" visibility="always">
                  <Icon48Block />
                </VKImage.Overlay>} */}

                                  {/* {!isDeleted && <Button mode="secondary" appearance="negative" size="l" onClick={() => handleDeleteClick(img.id)}>
                    <Icon36Delete />
                  </Button>} */}