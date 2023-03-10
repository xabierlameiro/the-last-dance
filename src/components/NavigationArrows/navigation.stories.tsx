// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import NavigarionArrows from '.';

export default {
    /* ๐ The title prop is optional.
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

//๐ We create a โtemplateโ of how args map to rendering
const Template: ComponentStory<typeof NavigarionArrows> = (args) => <NavigarionArrows {...args} />;

// ๐ Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    disabledLeft: false,
    disabledRight: false,
};
