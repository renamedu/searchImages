import React from 'react';
import { Progress } from '@vkontakte/vkui';

const ProgressBar = ({ appearance, value }) => {
    return (
        <Progress appearance={appearance} value={value} />
    );
};

export default ProgressBar;