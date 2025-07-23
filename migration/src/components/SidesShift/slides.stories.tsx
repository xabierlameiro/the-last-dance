// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import SidesShift from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Blog / SidesShift',
    component: SidesShift,
    parameters: {
        //👇 The viewports object from the Essentials addon
        viewport: {
            //👇 The viewports you want to use
            viewports: INITIAL_VIEWPORTS,
            //👇 Your own default viewport
            defaultViewport: 'iphone6',
        },
    },
} as ComponentMeta<typeof SidesShift>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof SidesShift> = (args) => <SidesShift {...args} />;

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    leftPosition: false,
};

Primary.parameters = {
    /* 👇 The parameters prop is optional. It allows you to configure the story. */
    // See https://storybook.js.org/docs/react/writing-stories/parameters
    // to learn more about the parameters prop
    // See https://storybook.js.org/docs/react/essentials/controls

    controls: { expanded: true },
};
