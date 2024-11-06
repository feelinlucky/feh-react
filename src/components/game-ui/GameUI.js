import React, { useEffect } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import MockChild from '../../components/mock-child/MockChild';

const GameUI = () => {
  const location = useLocation();
  const frontPageState = location.state;

  const character = frontPageState?.character;
  const map = frontPageState?.map;

  useEffect(() => {
    console.log('Character data:', character);
    console.log('Map data:', map);
  }, [character, map]);

  if (!character || !map) {
    console.log('Character or map is undefined');
    return <div>Loading...</div>;
  }

  const mapData = map.image || `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;

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
          <img src={mapData} alt="Game Map" className={styles['map-image']} />
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
