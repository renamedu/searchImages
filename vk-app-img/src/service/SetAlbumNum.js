export const setAlbumNum = function (albumId) {
  let trueNum = albumId;
  if (albumId == "-15") {trueNum = "000"} 
  else if (albumId == "-7") {trueNum = "00"} 
  else if (albumId == "-6") {trueNum = "0"}
  return trueNum
}