import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import Avatar from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Settings / Avatar',
    component: Avatar,
} as Meta<typeof Avatar>;

//👇 We create a “template” of how args map to rendering
const Template: StoryFn<typeof Avatar> = (args) => <Avatar {...args} />;

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    name: 'Juan Carlos de Borbón',
    description: 'Rey emérito de España',
    img: '/settings/avatar.png',
    alt: 'Quien bien se vive!',
};
