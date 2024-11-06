import React from 'react';
import Sprite from './Sprite';

export default {
  title: 'Components/Sprite', // Capitalize 'Components' for consistency
  component: Sprite,
};

const Template = (args) => <Sprite {...args} />;

export const Default = Template.bind({});
Default.args = {
    spriteName: "UiStatBg" // Capitalize 'W' to match your spriteData object
};