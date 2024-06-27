import React from 'react';
import { FixedLayout, Button } from '@vkontakte/vkui';
import { Icon16ChevronUpCircle } from '@vkontakte/icons';

const ScrollToTopButton = () => {
  return (
    <FixedLayout vertical="bottom" style={{ left: '16px', bottom: '56px', pointerEvents: 'none' }}>
      <Button 
        size="l" 
        mode="primary" 
        style={{ pointerEvents: 'auto'}} 
        rounded 
        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }}
      >
        <Icon16ChevronUpCircle />
      </Button>
    </FixedLayout>
  );
};

export default ScrollToTopButton;