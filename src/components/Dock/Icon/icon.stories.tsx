// Button.stories.js|jsx

import React from 'react';
import { menu } from '@/constants/navMenu';
import Icon from './';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Dock / Icon',
    component: Icon,
};

export const Primary = () => <Icon src={menu[0].img} alt={menu[0].alt} />;
