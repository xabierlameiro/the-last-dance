// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ControlButtons from '.';

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
    component: ControlButtons,
} as ComponentMeta<typeof ControlButtons>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof ControlButtons> = (args) => (
    <ControlButtons {...args} />
);

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    disabled: false,
};
