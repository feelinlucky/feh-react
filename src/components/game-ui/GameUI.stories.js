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
  mapData: {
    image: '/assets/images/map/Map_S0001.jpg',
    id: 'Map_S0001',
    terrain: [
        [0, 0, 1, 2, 'forest'],
        [1, 0, 2, 2, 'plain'],
        [3, 0, 5, 1, 'mountain'],
        [1, 3, 3, 4, 'water'],
        [6, 4, 7, 5, 'wall'],
    ]
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