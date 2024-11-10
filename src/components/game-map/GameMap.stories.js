import React from 'react';
import { Meta, Story } from '@storybook/react';
import GameMap from './GameMap';

export default {
  title: 'GameMap',
  component: GameMap
};

const Template = (args) => <GameMap {...args} />;

export const Default = Template.bind({});
Default.args = {
};
