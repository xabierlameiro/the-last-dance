// Button.stories.js|jsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import PostList from '.';

export default {
    /* π The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Blog / PostList',
    component: PostList,
} as ComponentMeta<typeof PostList>;

//π We create a βtemplateβ of how args map to rendering
const Template: ComponentStory<typeof PostList> = (args) => <PostList {...args} />;

// π Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    slug: 'post-1',
    category: 'blog',
    posts: [
        {
            meta: {
                title: 'The first post',
                excerpt: 'Resume of the first post',
                slug: 'post-1',
            },
        },
        {
            meta: {
                title: 'The second post',
                excerpt: 'Resume of the second post',
                slug: 'post-2',
            },
        },
    ],
};

Primary.parameters = {
    /* π The parameters prop is optional. It allows you to configure the story. */
    // See https://storybook.js.org/docs/react/writing-stories/parameters
    // to learn more about the parameters prop
    // See https://storybook.js.org/docs/react/essentials/controls
    // to learn more about the controls addon
    controls: { expanded: true },
};
