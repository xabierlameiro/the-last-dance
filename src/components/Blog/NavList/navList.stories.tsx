// Button.stories.js|jsx

import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import NavList from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Blog / NavList',
    component: NavList,
} as Meta<typeof NavList>;

//👇 We create a “template” of how args map to rendering
const Template: StoryFn<typeof NavList> = (args) => <NavList {...args} />;

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    title: 'Blog',
    category: 'All',
    isCategory: true,
    list: [
        {
            category: 'All',
            total: 10,
            href: '/blog',
            tag: 'a',
        },
    ],
};

Primary.parameters = {
    /* 👇 The parameters prop is optional. It allows you to configure the story. */
    // See https://storybook.js.org/docs/react/writing-stories/parameters
    // to learn more about the parameters prop
    // See https://storybook.js.org/docs/react/essentials/controls
    // to learn more about the controls addon
    controls: { expanded: true, hideNoControlsWarning: true, include: ['title', 'category', 'isCategory', 'list'] },
};
