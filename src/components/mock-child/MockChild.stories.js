import React from 'react';
import { Meta, Story } from '@storybook/react';
import MockChild from './MockChild';

export default {
  title: 'MockChild',
  component: MockChild,
  argTypes: {
    characterStatType: { control: 'text' },
    characterStatValue: { control: 'text' },
    characterStatName: { control: 'text' },
  },
};

const Template: Story<any> = (args) => <MockChild {...args} />;

export const CharacterStatUIDefault = Template.bind({});
CharacterStatUIDefault.args = {
  componentName: "CharacterStatUI",
  backgroundColor: "lightgray",
};

export const SingleCharacterStatUIDefault = Template.bind({});
SingleCharacterStatUIDefault.args = {
  componentName: "SingleCharacterStatUI",
  backgroundColor: "lightcoral",
  characterStatType: "TYPE",
  characterStatValue: "60",
};

export const CharacterStatPortraitDefault = Template.bind({});
CharacterStatPortraitDefault.args = {
  componentName: "CharacterStatPortrait",
  backgroundColor: "lightyellow",
  CharacterName: "Alfonse",
};

