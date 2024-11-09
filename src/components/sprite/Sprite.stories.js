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

export const CharPortraitDefault = Template.bind({});
CharPortraitDefault.args = {
  spriteName: "PortraitAlfonse",
};

export const ButtonBgDefault = Template.bind({});
ButtonBgDefault.args = {
  spriteName: "ButtonBg1",
};