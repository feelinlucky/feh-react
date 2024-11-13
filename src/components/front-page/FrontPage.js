import React, { useState } from 'react';
import styles from './FrontPage.module.css';
import { useNavigate } from 'react-router-dom';

export default function FrontPage() {
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  function handleUserInput(e) {
    setUserInput(e.target.value);
  }

  function handleDropdownChange(e) {
    setSelectedOption(e.target.value);
  }

  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (userInput.trim() === '') {
      alert('Please enter character name.');
      return;
    }

    if (selectedOption.trim() === '') {
      alert('Please select map.');
      return;
    }

    navigate('/game-ui', {
      state: {
        character: {
          charName: 'Alfonse',
          image: '/path/to/alfonse-image.jpg',
          level: 40,
          stats: { hp: 40, atk: 60, def: 25, spd: 40, res: 60 },
          weapon: { name: 'Levin Sword', icon: '/path/to/weapon-icon.png' }
        },
        map: {
          image: `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`,
          name: 'Map_S0001'
        }
      },
    });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.characterFormDisplay}>
          <h2 className={styles.uiH2}>FEH Simulator</h2>
          <form>
            <label htmlFor="characterName">Character Name:</label>
            <input id="characterName" type="text" onChange={handleUserInput} value={userInput} />
          </form>

          <div className={styles.dropdownContainer}>
            <h3 className={styles.uiH3}>Map Name</h3>
            <select id="mapName" value={selectedOption} onChange={handleDropdownChange}>
              <option value="">Select map</option>
              <option value="1">Stage 1</option>
              <option value="2">Stage 2</option>
              <option value="3">Stage 3</option>
              <option value="4">Stage 4</option>
            </select>
          </div>
          <div className={styles.characterInputDisplay}>
            <h2 className={styles.uiH2}>Current User Input: </h2>
            <h3 className={styles.uiH3}>{userInput}</h3>
            <h3 className={styles.uiH3}>Selected Class: {selectedOption}</h3>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={handleButtonClick}>
              START
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
