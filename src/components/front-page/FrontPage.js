import React, { useState } from 'react';
import styles from './FrontPage.module.css';
import { useNavigate } from 'react-router-dom';

function sort2DArray(arr) {
  return arr.sort((a, b) => {
    if (a[0] === b[0]) {
      return a[1] - b[1];
    }
    return a[0] - b[0];
  });
}

export default function FrontPage() {
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [mapData, setMapData] = useState({});

  function handleUserInput(e) {
    setUserInput(e.target.value);
  }

  async function handleDropdownChange(e) {
    const selectedMapId = e.target.value;
    if (!selectedMapId) {
      setSelectedOption('');
      return;
    }

    if (selectedMapId) {
      setSelectedOption(selectedMapId);
      try {
        const mapImagePath = `/assets/images/maps/Map_${selectedMapId}.png`;

        const importedMapData = await import(`../../../assets/data/map/Map_${selectedMapId}.json`);
        const mapName = importedMapData.default.name || selectedMapId; // Add .default and fallback
        const terrainData = importedMapData.default.terrain || []; // Add .default and fallback
        const allyPos = sort2DArray(importedMapData.default.allyPos) || []; // Add .default and fallback
        const foePos = sort2DArray(importedMapData.default.foePos) || [];

        setMapData({
          id: selectedMapId,
          mapName: mapName,
          imagePath: mapImagePath,
          terrain: terrainData,
          allyPos: allyPos,
          foePos: foePos
        });
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    }
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
          charName: userInput,
          image: '/path/to/default-character-image.jpg', // Replace with dynamic path if needed
          level: 40,
          stats: { hp: 40, atk: 60, def: 25, spd: 40, res: 60 },
          weapon: { name: 'Levin Sword', icon: '/path/to/weapon-icon.png' }, // Replace dynamically if needed
        },
        mapData: mapData, // Pass the fetched map data here
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
              <option value="S0001">Stage 1</option>
              <option value="S0002">Stage 2</option>
              <option value="S0101">Stage 3</option>
              <option value="S0102">Stage 4</option>
            </select>
          </div>
          <div className={styles.characterInputDisplay}>
            <h2 className={styles.uiH2}>Character Name: </h2>
            <h3 className={styles.uiH3}>{userInput}</h3>
            <h3 className={styles.uiH3}>Selected Map number: {selectedOption}</h3>
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