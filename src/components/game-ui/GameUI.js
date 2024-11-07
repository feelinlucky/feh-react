import React, { useEffect, useState } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import MockChild from '../../components/mock-child/MockChild';

const publicFolder = `${process.env.PUBLIC_URL}`;

const GameUI = () => {
  const location = useLocation();
  const frontPageState = location.state || {}; // Provide default empty object
  const character = frontPageState.character;
  const map = frontPageState.map;

  const [characterState, setCharacterState] = useState({}); // Initialize with an empty object
  const [mapState, setMapState] = useState({}); // Initialize with an empty object

  const characterSetup = () => {
    if (!character) {
      return {}; // Return an empty object if character is null
    }

    const { charName, level, stats, weapon } = character;
    const { hp, atk, spd, def, res } = stats || {}; // Handle potential null stats
    const wpn = weapon?.name || ''; // Handle potential null weapon
    const wpnIconUrl = weapon?.icon ? `${publicFolder}${weapon.icon}` : ''; // Handle potential null weapon icon
    
    return {
      charName: charName || '',
      level: level || 0,
      wpn,
      wpnIconUrl,
      hp: hp || 0,
      atk: atk || 0,
      spd: spd || 0,
      def: def || 0,
      res: res || 0
    };
  };

  const mapSetup = () => {
    if (!map) {
      return {}; // Return an empty object if map is null
    }

    const name = map.name || '';
    const imageUrl = map.image ? `${publicFolder}${map.image}` : `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;
    return { name, imageUrl };
  };

  useEffect(() => {
    setCharacterState(characterSetup());
    setMapState(mapSetup());
  }, [character, map]);

  console.log(characterState.charName);
  console.log(mapState.name);

  const mapImage = mapState.imageUrl || `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`; // TODO: add placeholder image
  return (
    <div className={styles['game-container']}>
      {console.log('Rendering GameUI')}
      <div className={styles['content-wrapper']}>
        <MockChild 
          componentName="CharacterStatUI" 
          width="40vw" 
          minWidth="720px" 
          backgroundColor="gray" 
          componentState={frontPageState} 
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
