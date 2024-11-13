import React from 'react';
import { Meta, Story } from '@storybook/react';
import MapCharacter from './MapCharacter';

export default {
    title: 'MapCharacter',
    component: MapCharacter,
    argTypes: {
        characterName: { control: 'text' },
    },
};

const Template: Story<any> = (args) => <MapCharacter {...args} />;

export const MapCharacterDefault = Template.bind({});
MapCharacterDefault.args = {
    characterName: "Alfonse",
};
