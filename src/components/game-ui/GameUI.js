import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import CharacterStatUI from '../character-stat-ui/CharacterStatUI';
import Sprite from '../sprite/Sprite';
import GameMap from '../game-map/GameMap';

// TODO make frontPageState.character setting connected to characterData  
import { characterData } from '../character-data/CharacterData';
import MapCharacter from '../map-character/MapCharacter';

const publicFolder = `${process.env.PUBLIC_URL}`;

const GameUI = () => {
  // Get setup from FrontPage
  const location = useLocation();
  const frontPageState = location.state || {};

  // Default UI states
  const [characterUIState, setCharacterUIState] = useState({});
  const [mapState, setMapState] = useState(frontPageState.map);
  const [clickedState, setClickedState] = useState(null);
  const [clickedStateHistory, setClickedStateHistory] = useState([]);
  const [gridAnchorCoordinates, setgridAnchorCoordinates] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState("Alfonse");
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);
  const [gridCenterAdjustment, setGridCenterAdjustment] = useState({ x: 0, y: 0 });

  const characterNames = ["Alfonse", "Sharena", "Anna", "Fjorm"];

  const [characters, setCharacters] = useState(
    characterNames.reduce((acc, name) => {
      acc[name] = characterData(name);
      return acc;
    }, {})
  );

  const [characterPositions, setCharacterPositions] = useState({
    Alfonse: { row: 0, col: 0 },
    Sharena: { row: 0, col: 1 },
    Anna: { row: 0, col: 2 },
    Fjorm: { row: 0, col: 3 }
  });

  // Grab grid center coordinates from GameMap
  const handlegridAnchorCoordinates = useCallback((gridAnchorCoordinates) => {
    setgridAnchorCoordinates(gridAnchorCoordinates);
  }, [mapState]);

  // Grab the current position of upper left corner of the map-container component 
  useEffect(() => {
    const updateMapPosition = () => {
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        setMapPosition({ x: rect.left, y: rect.top });
      }
    };

    // Initial position update
    updateMapPosition();

    // Set up an observer to detect when the element is fully rendered
    const observer = new ResizeObserver(() => {
      updateMapPosition();
    });

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    // Handle window resize
    window.addEventListener('resize', updateMapPosition);

    return () => {
      window.removeEventListener('resize', updateMapPosition);
      observer.disconnect();
    };
  }, []); // Empty dependency array since we're using ref

  // Log position changes in a separate effect
  useEffect(() => {
    setGridCenterAdjustment({ x: mapPosition.x, y: mapPosition.y });
  }, [mapPosition]);

  // Add the position of map-container to adjust grid center coordinates
  function rowColNumToGridCoord(rowNum, colNum) {
    const currentGridCenterCoordinate = { ...gridAnchorCoordinates[`${rowNum}-${colNum}`] };
    currentGridCenterCoordinate.x = currentGridCenterCoordinate.x + gridCenterAdjustment.x;
    currentGridCenterCoordinate.y = currentGridCenterCoordinate.y + gridCenterAdjustment.y;
    return currentGridCenterCoordinate;
  };

  useEffect(() => {
    if (selectedCharacter) {
      const selectedCharData = characters[selectedCharacter];

      setCharacterUIState({
        charName: selectedCharacter,
        level: selectedCharData.level,
        wpn: selectedCharData.wpn,
        hp: selectedCharData.hp,
        atk: selectedCharData.atk,
        spd: selectedCharData.spd,
        def: selectedCharData.def,
        res: selectedCharData.res
      });
    }
  }, [selectedCharacter, setCharacterUIState]);

  // Update UI State after click
  const handleGridClick = useCallback((gridY, gridX) => {
    const newState = { gridY, gridX };

    // Check if any character is at the clicked position
    for (const [charName, position] of Object.entries(characterPositions)) {
      if (position.row === gridY && position.col === gridX) {
        newState.characterName = charName;
        break;
      }
    }

    setClickedState(newState);
    setClickedStateHistory(prev => {
      const newHistory = [newState, ...prev].slice(0, 5);
      return newHistory;
    });
    console.log('Clicked grid cell:', gridY, gridX, ' at ', rowColNumToGridCoord(gridY, gridX));
  }, [setClickedState, rowColNumToGridCoord, characterPositions]);

  return (
    <div className={styles['game-container']}>
      <div className={styles['content-wrapper']}>
        <CharacterStatUI
          charName={characterUIState.charName || ''}
          level={characterUIState.level || 0}
          wpn={characterUIState.wpn || ''}
          hp={characterUIState.hp || 0}
          atk={characterUIState.atk || 0}
          spd={characterUIState.spd || 0}
          def={characterUIState.def || 0}
          res={characterUIState.res || 0}
        />
        <div ref={mapContainerRef} className={styles['map-container']}>
          <GameMap
            onGridClick={handleGridClick}
            ongridAnchorCoordinates={handlegridAnchorCoordinates}
          />
        </div>

        {/* Debug display for clickedState */}
        <div className={styles['debug-display']}>
          <div>Current Grid: {clickedState ? `Row: ${clickedState.gridY}, Col: ${clickedState.gridX}` : 'None'}</div>
          <div>Current Character: {clickedState ? `${clickedState.characterName}` : 'None'}</div>
          <div>History:</div>
          {clickedStateHistory.map((state, index) => (
            <div key={index} style={{ opacity: 1 - index * 0.2 }}>
              {index + 1}: Row: {state.gridY}, Col: {state.gridX}
            </div>
          ))}
        </div>

        {Object.keys(characters).map((charName) => {
          const pos = characterPositions[charName];
          const coordinates = rowColNumToGridCoord(pos.row, pos.col);
          console.log('Character:', charName, 'Coordinates:', coordinates);
          return coordinates && (
            <div
              key={charName}
              className={styles['character-overlay']}
              style={{
                left: `${coordinates.x}px`,
                top: `${coordinates.y}px`
              }}
            >
              <MapCharacter
                characterName={charName}
              />
            </div>
          );
        })}

        <div className={styles['actionButtonsContainer']}>
          <div className={styles['button-group']}>
            <div className={styles['leftAlignedButtons']}>
              <Sprite spriteName="ButtonBg1">
                <button className={styles['action-button']}>1</button>
              </Sprite>
              <Sprite spriteName="ButtonBg1">
                <button className={styles['action-button']}>2</button>
              </Sprite>
              <Sprite spriteName="ButtonBg1">
                <button className={styles['action-button']}>3</button>
              </Sprite>
            </div>
            <div className={styles['rightAlignedButtons']}>
              <Sprite spriteName="ButtonBg1">
                <button className={styles['action-button']}>4</button>
              </Sprite>
              <Sprite spriteName="ButtonBg1">
                <button className={styles['action-button']}>5</button>
              </Sprite>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
