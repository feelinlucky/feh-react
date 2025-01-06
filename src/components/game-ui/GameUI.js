/*
 * GameUI.js
 * Main component for the Fire Emblem Heroes game interface
 * Handles character positioning, movement, interactions, and game state management
 */

/* #region Import frameworks */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useLocation } from 'react-router-dom';
import CharacterStatUI from '../character-stat-ui/CharacterStatUI';
import GameMap from '../game-map/GameMap';
import DraggableCharacter from './DraggableCharacter';
import DebugDisplay from './DebugDisplay';
import LogPanel from './LogPanel';
import {
  findNearestGridEdgeToCursor,
  calculateGridDistance,
  calculateCharDistance,
} from './helpers';
import { sharedProps, characterData } from '../character-data/CharacterData';
import styles from './GameUI.module.css';
/* #endregion */

const GameUI = () => {
  const location = useLocation();
  const frontPageState = location.state || {};

  /* #region State for map and characters */
  const [characterPositions, setCharacterPositions] = useState({
    Alfonse: { row: 0, col: 0 },
    Sharena: { row: 0, col: 1 },
    Anna: { row: 0, col: 2 },
    Fjorm: { row: 0, col: 3 },
    FighterSword: { row: 0, col: 4 },
  });
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [logText, setLogText] = useState([]);
  const [debugState, setDebugState] = useState({
    isDebugVisible: true,
    isCursorObserverActive: false,
    cursorPosition: null,
  });
  /* #endregion */

  /* #region Map state */
  const [gridAnchorCoordinates, setGridAnchorCoordinates] = useState({});
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });

  const handleLogUpdate = (newLog, category = 'uncategorized') => {
    setLogText((prev) => [{ text: newLog, category }, ...prev].slice(0, 6));
  };

  const handleGridClick = useCallback((row, col) => {
    // Handle grid click logic (similar to original implementation)
    // Select character, move character, or reset selection
  }, [selectedCharacter, characterPositions, highlightedCells]);

  const handleDragUpdate = useCallback((dragInfo) => {
    // Handle drag update logic for cursor position and dragging state
  }, []);
  /* #endregion */

  return (
    <div className={styles['game-container']}>
      <div className={styles['content-wrapper']}>
        {/* Character Stats Display */}
        <CharacterStatUI
          charName={selectedCharacter}
          {...(characterData(selectedCharacter) || {})}
        />

        {/* Main Game Map */}
        <div className={styles['map-container']}>
          <GameMap
            onGridClick={handleGridClick}
            ongridAnchorCoordinates={setGridAnchorCoordinates}
            clickedState={null} // Add clicked state logic
            highlightedCells={highlightedCells}
            terrainData={frontPageState.map || []}
          />
          {Object.entries(characterPositions).map(([charName, position]) => (
            <DraggableCharacter
              key={charName}
              charName={charName}
              coordinates={{
                x: gridAnchorCoordinates[`${position.row}-${position.col}`]?.x || 0,
                y: gridAnchorCoordinates[`${position.row}-${position.col}`]?.y || 0,
              }}
              isSelected={selectedCharacter === charName}
              setParentIsDragging={() => { }} // Add dragging logic
              setSelectedCharacter={setSelectedCharacter}
              setHighlightedCells={setHighlightedCells}
              characterPositions={characterPositions}
              terrainData={frontPageState.map}
              setCharacterPositions={setCharacterPositions}
              updateLogText={handleLogUpdate}
            />
          ))}
        </div>

        {/* Debug Display */}
        <DebugDisplay debugState={debugState} setDebugState={setDebugState} />

        {/* Log Panel */}
        <LogPanel logText={logText} />
      </div>
    </div>
  );
};

export default GameUI;