// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import LangeSelect from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Form / LangeSelect',
    component: LangeSelect,
} as ComponentMeta<typeof LangeSelect>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof LangeSelect> = (args) => <LangeSelect />;

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {};
