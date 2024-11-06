import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import SingleCharacterStatUI from './SingleCharacterStatUI';

export default {
  title: 'SingleCharacterStatUI',
  component: SingleCharacterStatUI,
  argTypes: {
    CharacterStatType: { control: 'text' },
  },
};

const Template = (args) => <SingleCharacterStatUI {...args} />;

export const Default = Template.bind({});
Default.args = {
  CharacterStatType: 'Attack',
};

export const DifferentStatType = Template.bind({});
DifferentStatType.args = {
  CharacterStatType: 'Defense',
};

export const LongStatType = Template.bind({});
LongStatType.args = {
  CharacterStatType: 'Magic Resistance',
};
