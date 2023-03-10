// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import GridLayoutControl from '.';

export default {
    /* ๐ The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Settings / GridLayoutControl',
    component: GridLayoutControl,
} as ComponentMeta<typeof GridLayoutControl>;

//๐ We create a โtemplateโ of how args map to rendering
const Template: ComponentStory<typeof GridLayoutControl> = (args) => <GridLayoutControl {...args} />;

// ๐ Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    routeName: 'System Preferences',
};
