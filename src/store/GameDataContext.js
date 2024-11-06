import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  character: {
    name: 'Alfonse',
    image: '/path/to/alfonse-image.jpg',
    level: 40,
    stats: { hp: 40, atk: 60, def: 25, spd: 40, res: 60 },
    weapon: { name: 'Levin Sword', icon: '/path/to/weapon-icon.png' },
  },
  map: {
    image: '${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg',
  },
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_CHARACTER':
      return { ...state, character: { ...state.character, ...action.payload } };
    case 'UPDATE_MAP':
      return { ...state, map: { ...state.map, ...action.payload } };
    default:
      return state;
  }
}

// Create context
const GameDataContext = createContext();

// Provider component
export function GameDataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GameDataContext.Provider value={{ state, dispatch }}>
      {children}
    </GameDataContext.Provider>
  );
}

// Custom hook to use the game data
export function useGameData() {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
}