// Button.stories.js|jsx

import React from 'react';
import SearchInput from '.';
import { ComponentStory } from '@storybook/react';

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Form / SearchInput',
    component: SearchInput,
    argTypes: {
        onBlur: { action: 'onBlur' },
        onChange: { action: 'onChange' },
    },
};

const Template: ComponentStory<typeof SearchInput> = (args) => (
    <SearchInput {...args} />
);

// 👇 Each story then reuses that template
export const Primary = Template.bind({});

Primary.args = {
    disabled: false,
    placeHolderText: 'Search',
    value: '',
};
