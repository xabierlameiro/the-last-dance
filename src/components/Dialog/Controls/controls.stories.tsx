// Button.stories.js|jsx

import React from 'react';
import Controls from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Dialog / Controls',
    component: Controls,
};

export const Primary = () => <Controls />;
