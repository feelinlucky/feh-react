import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GameUI from './GameUI';
import { GameDataProvider } from '../../store/GameDataContext';

const mockState = {
  character: {
    charName: 'Alfonse',
    image: '/path/to/alfonse-image.jpg',
    level: 40,
    stats: { hp: 40, atk: 60, def: 25, spd: 40, res: 60 },
    weapon: { name: 'Levin Sword', icon: '/path/to/weapon-icon.png' }
  },
  map: {
    image: '/assets/images/map/Map_S0001.jpg',
    name: 'Map_S0001'
  }
};

const withProviders = (Story) => (
  <MemoryRouter initialEntries={[{ pathname: '/game', state: mockState }]}>
    <GameDataProvider>
      <Routes>
        <Route path="/game" element={<Story />} />
      </Routes>
    </GameDataProvider>
  </MemoryRouter>
);

export default {
  title: 'GameUI',
  component: GameUI,
  decorators: [withProviders],
  parameters: {
    layout: 'fullscreen'
  }
};

const Template = () => <GameUI />;

export const Default = Template.bind({});