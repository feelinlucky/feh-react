import React, { useEffect, useState, useCallback } from 'react';
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
  const [gridCenterCoordinates, setGridCenterCoordinates] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState("Alfonse");

  const characterNames = ["Alfonse", "Sharena", "Anna", "Fjorm"];

  const [characters, setCharacters] = useState(
    characterNames.reduce((acc, name) => {
      acc[name] = characterData(name);
      return acc;
    }, {})
  );

  const handleGridCenterCoordinates = useCallback((gridCenterCoordinates) => {
    setGridCenterCoordinates(gridCenterCoordinates);
  }, [mapState]);

  function rowColNumToGridCoord (rowNum, colNum) {
    return gridCenterCoordinates[`${rowNum}-${colNum}`];
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
    setClickedState({ gridY, gridX });    
    console.log('Clicked grid cell:', gridY, gridX, ' at ', rowColNumToGridCoord(gridY, gridX));    
  }, [setClickedState, rowColNumToGridCoord]);
  
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
        <div className={styles['map-container']}>
          <GameMap
            onGridClick={handleGridClick}
            onGridCenterCoordinates={handleGridCenterCoordinates}
          />
        </div>

        {Object.keys(characters).map((charName) => (
          <MapCharacter
            key={charName}
            characterName={charName}
          />
        ))}
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
