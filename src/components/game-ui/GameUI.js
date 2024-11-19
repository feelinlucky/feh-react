import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import CharacterStatUI from '../character-stat-ui/CharacterStatUI';
import Sprite from '../sprite/Sprite';
import GameMap, { calculateCellsInRadius, defineTerrainGrid } from '../game-map/GameMap';

// TODO make frontPageState.character setting connected to characterData  
import { sharedProps, characterData } from '../character-data/CharacterData';
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

  // Set character base properties
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

      // Load shared properties
      const selectedCharProps = sharedProps[selectedCharData.type];
    } else {
      setCharacterUIState({
        charName: '',
        level: 0,
        wpn: '',
        hp: 0,
        atk: 0,
        spd: 0,
        def: 0,
        res: 0
      });
    }
  }, [selectedCharacter, setCharacterUIState]);

  // Update UI State after click
  const handleGridClick = useCallback((gridY, gridX) => {
    const newState = { gridY, gridX, isMapGrid: true };

    // Check if any character is at the clicked position
    for (const [charName, position] of Object.entries(characterPositions)) {
      if (position.row === gridY && position.col === gridX) {
        newState.characterName = charName;
        setSelectedCharacter(charName);
        break;
      } else {
        setSelectedCharacter(null);
      }
    }

    setClickedState(newState);
    setClickedStateHistory(prev => {
      const newHistory = [newState, ...prev].slice(0, 5);
      return newHistory;
    });
    console.log('Clicked grid cell:', gridY, gridX, ' at ', rowColNumToGridCoord(gridY, gridX));
  }, [setClickedState, rowColNumToGridCoord, characterPositions, setSelectedCharacter]);

  // Handle clicks outside of GameMap
  const handleContainerClick = useCallback((event) => {
    // If the click is inside map-container, do nothing
    if (event.target.closest(`.${styles['map-container']}`)) {
      return;
    }

    // Set placeholder state for clicks outside GameMap
    const newState = {
      gridY: null,
      gridX: null,
      isMapGrid: false,
      characterName: null
    };

    setClickedState(newState);
    setSelectedCharacter(null);
    setClickedStateHistory(prev => {
      const newHistory = [newState, ...prev].slice(0, 5);
      return newHistory;
    });
  }, [setClickedState, setSelectedCharacter]);

  return (
    <div className={styles['game-container']} onClick={handleContainerClick}>
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
        <div className={styles['map-container']} ref={mapContainerRef}>
          <GameMap
            onGridClick={handleGridClick}
            ongridAnchorCoordinates={handlegridAnchorCoordinates}
            clickedState={clickedState}
            highlightedCells={
              clickedState && clickedState.characterName && characters[clickedState.characterName]
                ? calculateCellsInRadius(
                  clickedState.gridY,
                  clickedState.gridX,
                  sharedProps.moveTypes[characters[clickedState.characterName].type].distance
                )
                : null
            }
            terrainData={
              defineTerrainGrid([
                // Format: [upperLeftX, upperLeftY, lowerRightX, lowerRightY, terrainType]
                [0, 0, 2, 2, 'forest'],     // Forest in top-left 3x3 area
                [3, 0, 5, 1, 'mountain'],   // Mountains in top-right area
                [1, 3, 3, 4, 'water'],      // Water in middle area
                [6, 4, 7, 5, 'wall'],       // Wall in bottom-right corner
              ])
            }
          />
        </div>

        {/* Debug display for clickedState */}
        <div className={styles['debug-display']}>
          <div>Current Grid: {clickedState ? `Row: ${clickedState.gridY}, Col: ${clickedState.gridX}` : 'None'}</div>
          <div>Current Character: {clickedState ? `${clickedState.characterName}` : 'None'}</div>
          <div>calculateCellsInRadius inputs:</div>
          <div>- centerRow: {clickedState ? clickedState.gridY : 'None'}</div>
          <div>- centerCol: {clickedState ? clickedState.gridX : 'None'}</div>
          <div>- radius: {
            clickedState && clickedState.characterName && characters[clickedState.characterName]
              ? sharedProps.moveTypes[characters[clickedState.characterName].type].distance
              : 'None'
          }</div>
          <div>Highlighted Cells: {
            clickedState && clickedState.characterName && characters[clickedState.characterName]
              ? calculateCellsInRadius(
                clickedState.gridY,
                clickedState.gridX,
                sharedProps.moveTypes[characters[clickedState.characterName].type].distance
              ).map(cell => `[${cell.row},${cell.col}]`).join(', ')
              : 'None'
          }</div>
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
          const dist = sharedProps.moveTypes[characters[charName].type].distance;
          console.log('Character:', charName, 'Coordinates:', coordinates, 'Distance:', dist);
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
