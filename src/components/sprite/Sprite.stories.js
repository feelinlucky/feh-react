import React from 'react';
import Sprite from './Sprite';

export default {
  title: 'Components/Sprite',
  component: Sprite,
};

const Template = (args) => <Sprite {...args} />;

export const Default = Template.bind({});
Default.args = {
    spriteName: "UiStatBg"
};