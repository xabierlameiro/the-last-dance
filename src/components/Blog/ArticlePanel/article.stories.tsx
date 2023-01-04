// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ArticlePanel from '.';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Blog / ArticlePanel',
    component: ArticlePanel,
} as ComponentMeta<typeof ArticlePanel>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof ArticlePanel> = (args) => <ArticlePanel {...args} />;

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.parameters = {
    /* 👇 The parameters prop is optional. It allows you to configure the story. */
    // See https://storybook.js.org/docs/react/writing-stories/parameters
    // to learn more about the parameters prop
    // See https://storybook.js.org/docs/react/essentials/controls
    // to learn more about the controls addon
    controls: { expanded: true },
};

Primary.args = {
    readTime: '5',
};
