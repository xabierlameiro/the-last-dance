// Button.stories.js|jsx

import React from 'react';
import { menu } from '@/constants/navMenu';
import type { StoryFn } from '@storybook/react';
import Icon from './';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Dock / Icon',

    component: Icon,
    argTypes: {
        src: {
            control: 'select',
            options: [menu[0].img, menu[1].img, menu[2].img, menu[3].img],
        },
    },
};

const Template: StoryFn<typeof Icon> = (args) => <Icon {...args} />;

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    src: menu[0].img,
    alt: menu[0].alt,
};
