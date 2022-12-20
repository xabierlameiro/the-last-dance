// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import NavigarionArrows from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Controls / NavigarionArrows',
    argTypes: {
        onClickRight: { action: 'onClickRight' },
        onClickLeft: { action: 'onClickLeft' },
    },

    component: NavigarionArrows,
} as ComponentMeta<typeof NavigarionArrows>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof NavigarionArrows> = (args) => (
    <NavigarionArrows {...args} />
);

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    disabledLeft: false,
    disabledRight: false,
};

Primary.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('left'));
    await userEvent.click(canvas.getByTestId('right'));
};
