import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GameUI from './GameUI';
import { GameDataProvider } from '../../store/GameDataContext';

function sort2DArray(arr) {
  return arr.sort((a, b) => {
    if (a[0] === b[0]) {
      return a[1] - b[1];
    }
    return a[0] - b[0];
  });
}

const selectedMapId = 'S0001';
const importedMapData = await import(`../../../public/assets/data/map/Map_${selectedMapId}.json`);
const mapName = importedMapData.default?.name || selectedMapId;
const terrainData = importedMapData.default?.terrain || [];
const allyPos = sort2DArray(importedMapData.default?.allyPos || []);
const foePos = sort2DArray(importedMapData.default?.foePos || []);

const mockState = {
  character: {
    charName: 'Alfonse',
    image: '/path/to/alfonse-image.jpg',
    level: 40,
    stats: { hp: 40, atk: 60, def: 25, spd: 40, res: 60 },
    weapon: { name: 'Levin Sword', icon: '/path/to/weapon-icon.png' }
  },
  mapData: {
    id: selectedMapId,
    mapName: mapName,
    imagePath: `/assets/images/maps/Map_${selectedMapId}.png`,
    terrain: terrainData,
    allyPos: allyPos,
    foePos: foePos
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