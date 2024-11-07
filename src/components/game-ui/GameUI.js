import React, { useEffect, useState } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import CharacterStatUI from '../character-stat-ui/CharacterStatUI';  // Updated import path
const publicFolder = `${process.env.PUBLIC_URL}`;

const GameUI = () => {
  const location = useLocation();
  const frontPageState = location.state || {};
  const character = frontPageState.character;
  const map = frontPageState.map;

  const [characterState, setCharacterState] = useState({});
  const [mapState, setMapState] = useState({});

  const characterSetup = () => {
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
  };

  const mapSetup = () => {
    if (!map) {
      return {};
    }

    const name = map.name || '';
    const imageUrl = map.image ? `${publicFolder}${map.image}` : `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;
    return { name, imageUrl };
  };

  useEffect(() => {
    setCharacterState(characterSetup());
    setMapState(mapSetup());
  }, [character, map]);

  const mapImage = mapState.imageUrl || `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;

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
          <img src={mapImage} alt="Game Map" className={styles['map-image']} />
        </div>
        <div className={styles['actionButtonsContainer']}>
          <div className={styles['button-group']}>
            <div className={styles['leftAlignedButtons']}>
              <button className={styles['action-button']}>1</button>
              <button className={styles['action-button']}>2</button>
            </div>
            <div className={styles['rightAlignedButtons']}>
              <button className={styles['action-button']}>3</button>
              <button className={styles['action-button']}>4</button>
              <button className={styles['action-button']}>5</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
