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

export const CharPortraitAnna = Template.bind({});
CharPortraitAnna.args = {
  spriteName: "PortraitAnna",
};

export const CharPortraitSharena = Template.bind({});
CharPortraitSharena.args = {
  spriteName: "PortraitSharena",
};

export const CharPortraitFjorm = Template.bind({});
CharPortraitFjorm.args = {
  spriteName: "PortraitFjorm",
};

export const CharPortraitFighterSword = Template.bind({});
CharPortraitFighterSword.args = {
  spriteName: "PortraitFighterSword",
};

export const ButtonBgDefault = Template.bind({});
ButtonBgDefault.args = {
  spriteName: "ButtonBg1",
};