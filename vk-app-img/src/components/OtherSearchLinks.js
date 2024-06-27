import React from 'react';
import { ButtonGroup, Button, Link } from '@vkontakte/vkui';
import { Icon12ArrowUpRightOutSquareOutline } from '@vkontakte/icons';

const OtherSearchLinks = ({ imgId, searchImgResArr }) => {
  return (
    <ButtonGroup stretched align="right" gap="m" style={{ marginTop: '8px' }}>
      <Link href={searchImgResArr[imgId].otherSearchHrefs.google} target="_blank" style={{ textDecoration: 'none' }}>
        <Button mode="primary" size="s" after={<Icon12ArrowUpRightOutSquareOutline />} key="google">google</Button>
      </Link>
      <Link href={searchImgResArr[imgId].otherSearchHrefs.saucenao} target="_blank" style={{ textDecoration: 'none' }}>
        <Button mode="primary" size="s" after={<Icon12ArrowUpRightOutSquareOutline />} key="saucenao">saucenao</Button>
      </Link>
      <Link href={searchImgResArr[imgId].otherSearchHrefs.tineye} target="_blank" style={{ textDecoration: 'none' }}>
        <Button mode="primary" size="s" after={<Icon12ArrowUpRightOutSquareOutline />} key="tineye">tineye</Button>
      </Link>
    </ButtonGroup>
  );
};
  
export default OtherSearchLinks;