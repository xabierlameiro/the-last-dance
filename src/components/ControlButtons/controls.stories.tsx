// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import Controls from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Controls / Buttons',
    argTypes: {
        onClickClose: { action: 'onClickClose' },
        onClickMinimise: { action: 'onClickMinimise' },
        onClickMaximise: { action: 'onClickMaximise' },
    },
    component: Controls,
} as ComponentMeta<typeof Controls>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Controls> = (args) => (
    <Controls {...args} />
);

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    disabled: false,
};

Primary.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle('Close'));
    await userEvent.click(canvas.getByTitle('Minimise'));
    await userEvent.click(canvas.getByTitle('Maximise'));
};
