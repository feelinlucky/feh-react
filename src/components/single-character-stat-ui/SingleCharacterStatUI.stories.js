import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import SingleCharacterStatUI from './SingleCharacterStatUI';

export default {
  title: 'SingleCharacterStatUI',
  component: SingleCharacterStatUI,
  argTypes: {
    characterStatType: { control: 'text' },
  },
};

const Template = (args) => <SingleCharacterStatUI {...args} />;

export const Default = Template.bind({});
Default.args = {
  characterStatType: 'ATK',
  characterStatValue: 60,
};

export const DifferentStatType = Template.bind({});
DifferentStatType.args = {
  characterStatType: 'DEF',
  characterStatValue: 60,
};

export const LongStatType = Template.bind({});
LongStatType.args = {
  characterStatType: 'RES',
  characterStatValue: 60,
};
