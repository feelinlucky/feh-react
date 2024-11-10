import React, { useEffect, useState, useCallback } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import CharacterStatUI from '../character-stat-ui/CharacterStatUI';  // Updated import path
import Sprite from '../sprite/Sprite';
import GameMap from '../game-map/GameMap';

const publicFolder = `${process.env.PUBLIC_URL}`;

const GameUI = () => {
  const location = useLocation();
  const frontPageState = location.state || {};
  const character = frontPageState.character;
  const map = frontPageState.map;

  const [characterState, setCharacterState] = useState({});
  const [mapState, setMapState] = useState({});

  const characterSetup = useCallback(() => {
    if (!character) {
      return {};
    }

    const { charName, level, stats, weapon } = character;
    const { hp, atk, spd, def, res } = stats || {};
    const wpn = weapon?.name || '';
    const wpnIconUrl = weapon?.icon ? `${publicFolder}${weapon.icon}` : '';

    return {
      charName: charName || '',
      level: level || 0,
      wpn,
      wpnIconUrl,
      hp: hp || 0,
      atk: atk || 0,
      spd: spd || 0,
      def: def || 0,
      res: res || 0,
    };
  }, [character]);
  const mapSetup = useCallback(() => {
    if (!map) {
      return {};
    }

    const name = map.name || '';
    const imageUrl = map.image ? `${publicFolder}${map.image}` : `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;
    return { name, imageUrl };
  }, [map]);

  useEffect(() => {
    setCharacterState(characterSetup());
    setMapState(mapSetup());
  }, [characterSetup, mapSetup]);

  const mapImage = mapState.imageUrl || `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;

  const handleGridClick = useCallback((gridX, gridY) => {
    // Implement your grid click handling logic here.
    console.log(`Grid clicked at X: ${gridX}, Y: ${gridY}`);
    // Example:  Make an API call to update game state based on the clicked grid.
    // fetch(`/api/game/update?x=${gridX}&y=${gridY}`, {method: 'POST'})
    //   .then(response => response.json())
    //   .then(data => {
    //     // Update UI based on API response
    //   })
    //   .catch(error => {
    //     console.error('Error updating game state:', error);
    //   });

  }, []);


  return (
    <div className={styles['game-container']}>
      <div className={styles['content-wrapper']}>
        <CharacterStatUI
          charName={characterState.charName}
          level={characterState.level}
          wpn={characterState.wpn}
          hp={characterState.hp}
          atk={characterState.atk}
          spd={characterState.spd}
          def={characterState.def}
          res={characterState.res}
        />
        <div className={styles['map-container']}>
          <GameMap
              onGridClick={handleGridClick}
          />
        </div>
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