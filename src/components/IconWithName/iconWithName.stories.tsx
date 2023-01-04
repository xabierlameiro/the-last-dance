// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import IconWithName from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Settings / IconWithName',
    component: IconWithName,
    argTypes: {
        icon: { control: 'text' },
        alt: { control: 'text' },
        name: { control: 'text' },
        horizontal: { control: 'boolean' },
    },
} as ComponentMeta<typeof IconWithName>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof IconWithName> = (args) => <IconWithName {...args} />;

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    icon: '/language.jpeg',
    alt: 'This is an icon',
    name: 'Settings',
    horizontal: true,
};
