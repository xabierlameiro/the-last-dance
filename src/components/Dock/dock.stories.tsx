// Button.stories.js|jsx

import React from 'react';
import Dock from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Dock / Dock',
    component: Dock,
};

export const Primary = () => <Dock />;
