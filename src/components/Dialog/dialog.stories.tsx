// Button.stories.js|jsx

import React from 'react';
import Dialog from '.';
import { ComponentStory } from '@storybook/react';
import ControlButtons from '@/components/ControlButtons';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Asides / Dialog',
    component: Dialog,
};

const Template: ComponentStory<typeof Dialog> = (args) => <Dialog {...args} />;

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    open: true,
    modalMode: true,
    withPadding: true,
    header: () => <ControlButtons />,
};
