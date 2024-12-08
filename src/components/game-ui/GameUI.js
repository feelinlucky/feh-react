/*
 * GameUI.js
 * Main component for the Fire Emblem Heroes game interface
 * Handles character positioning, movement, interactions, and game state management
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import CharacterStatUI from '../character-stat-ui/CharacterStatUI';
import Sprite from '../sprite/Sprite';
import GameMap, {
  visualizeTerrainGrid,
  defineTerrainGrid, 
  TerrainType, 
  calculateMovementRange
} from '../game-map/GameMap';

import { sharedProps, characterData } from '../character-data/CharacterData';
import MapCharacter from '../map-character/MapCharacter';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

// Define path to public assets folder
const publicFolder = `${process.env.PUBLIC_URL}`;

/**
 * DraggableCharacter Component
 * Renders a draggable character sprite on the game map
 * @param {Object} props - Component props
 * @param {string} props.charName - Character's name identifier
 * @param {Object} props.coordinates - X and Y coordinates for character position
 * @param {boolean} props.isSelected - Whether the character is currently selected
 * @param {function} props.onDragUpdate - Callback for drag position updates
 */
const DraggableCharacter = ({ charName, coordinates, isSelected, onDragUpdate }) => {
  const overlayRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = overlayRef.current;
    if (el && isSelected) {
      const cleanup = draggable({
        element: el,
        data: {
          character: charName,
        },
        onDragStart: (event) => {
          setIsDragging(true);
          if (event.clientX !== undefined && event.clientY !== undefined) {
            onDragUpdate({
              cursorX: event.clientX,
              cursorY: event.clientY
            });
          }
        },
        onDrag: (event) => {
          setIsDragging(true);
          if (event.clientX !== undefined && event.clientY !== undefined) {
            onDragUpdate({
              cursorX: event.clientX,
              cursorY: event.clientY
            });
          }
        },
        onDrop: () => {
          setIsDragging(false);
          onDragUpdate(null);
        },
        onDragEnd: () => {
          setIsDragging(false);
          onDragUpdate(null);
        },
      });

      const handleMouseMove = (event) => {
        if (isDragging) {
          onDragUpdate({
            cursorX: event.clientX,
            cursorY: event.clientY
          });
        }
      };

      document.addEventListener('mousemove', handleMouseMove);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        cleanup?.();
      };
    }
  }, [isSelected, charName, isDragging, onDragUpdate]);

  return (
    <div
      ref={overlayRef}
      className={styles['character-overlay']}
      style={{
        left: `${coordinates.x}px`,
        top: `${coordinates.y}px`,
        cursor: isSelected ? 'grab' : 'pointer',
        userSelect: 'none',
        pointerEvents: isSelected ? 'auto' : 'none',
        opacity: isDragging ? 0.7 : 1,
      }}
      data-dragging={isDragging}
    >
      <div style={{ pointerEvents: 'none' }}>
        <MapCharacter
          characterName={charName}
        />
      </div>
    </div>
  );
};

/**
 * Calculates the grid distance between two characters using Manhattan distance
 * @param {string} char1Name - Name of the first character
 * @param {string} char2Name - Name of the second character
 * @param {Object} positions - Object containing character positions
 * @returns {number} The grid distance between the two characters
 */
const calculateGridDistance = (char1Name, char2Name, positions) => {
  const char1Pos = positions[char1Name];
  const char2Pos = positions[char2Name];
  
  if (!char1Pos || !char2Pos) {
    return null;
  }
  
  // Calculate Manhattan distance (|x1 - x2| + |y1 - y2|)
  return Math.abs(char1Pos.row - char2Pos.row) + Math.abs(char1Pos.col - char2Pos.col);
};

/**
 * Finds the nearest edge of the current grid cell relative to cursor position
 * @param {Object} draggedOverGrid - The grid position being dragged over {row, col}
 * @param {Object} cursorPos - Current cursor position {x, y}
 * @param {Object} gridAnchors - Grid anchor coordinates for each cell
 * @returns {string} The nearest edge direction ('up', 'right', 'down', 'left')
 */
const findNearestEmptyGridPosition = (draggedOverGrid, cursorPos, gridAnchors) => {
  // Get the center coordinates of the current grid cell
  const currentGridAnchor = gridAnchors[`${draggedOverGrid.row}-${draggedOverGrid.col}`];
  
  if (!currentGridAnchor) {
    return null;
  }

  // Calculate relative position of cursor from grid center
  const relativeX = cursorPos.x - currentGridAnchor.x;
  const relativeY = cursorPos.y - currentGridAnchor.y;

  // Use absolute values for comparison
  const absX = Math.abs(relativeX);
  const absY = Math.abs(relativeY);

  // Determine nearest edge by comparing relative positions
  if (absX > absY) {
    // Horizontal edges are closer
    return relativeX > 0 ? 'right' : 'left';
  } else {
    // Vertical edges are closer
    return relativeY > 0 ? 'down' : 'up';
  }
};

/**
 * GameUI Component
 * Main game interface component that manages:
 * - Character positioning and movement
 * - Game state and UI state
 * - Map rendering and interactions
 * - Character selection and highlighting
 * - Drag and drop functionality
 */
const GameUI = () => {
  // Get initial setup state from the front page
  const location = useLocation();
  const frontPageState = location.state || {};

  // State management for UI elements and game mechanics
  const [characterUIState, setCharacterUIState] = useState({}); // Manages character UI properties
  const [mapState, setMapState] = useState(frontPageState.map); // Controls map state
  const [clickedState, setClickedState] = useState(null); // Tracks clicked positions
  const [clickedStateHistory, setClickedStateHistory] = useState([]); // Maintains history of clicks
  const [gridAnchorCoordinates, setgridAnchorCoordinates] = useState({}); // Stores grid position anchors
  const [selectedCharacter, setSelectedCharacter] = useState("Alfonse"); // Currently selected character
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 }); // Map viewport position
  const mapContainerRef = useRef(null); // Reference to map container element
  const [gridCenterAdjustment, setGridCenterAdjustment] = useState({ x: 0, y: 0 }); // Grid centering adjustments
  const [highlightedCells, setHighlightedCells] = useState([]); // Cells to highlight on the map
  const [debugInfo, setDebugInfo] = useState(null); // Debugging information
  const [draggedOverCell, setDraggedOverCell] = useState(null); // Currently dragged-over cell

  // Define character teams
  const allyNames = ["Alfonse", "Sharena", "Anna", "Fjorm"];
  const foeNames = ["FighterSword"];
  const characterNames = [...allyNames, ...foeNames];

  // Initialize character data with base properties
  const [characters, setCharacters] = useState(
    characterNames.reduce((acc, name) => {
      acc[name] = characterData(name);
      return acc;
    }, {})
  );

  // Set initial character positions on the grid
  const [characterPositions, setCharacterPositions] = useState({
    Alfonse: { row: 0, col: 0 },
    Sharena: { row: 0, col: 1 },
    Anna: { row: 0, col: 2 },
    Fjorm: { row: 0, col: 3 },
    FighterSword: { row: 0, col: 4 }
  });

  /**
   * Callback to receive and store grid anchor coordinates from GameMap
   * These coordinates are used for precise character positioning
   */
  const handlegridAnchorCoordinates = useCallback((gridAnchorCoordinates) => {
    setgridAnchorCoordinates(gridAnchorCoordinates);
  }, [mapState]);

  /**
   * Effect hook to track and update map container position
   * Sets up observers for container position changes and window resizing
   * Critical for maintaining accurate grid positioning relative to viewport
   */
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
  }, []); 

  /**
   * Effect hook to update grid center adjustment when map position changes
   * Ensures grid coordinates stay aligned with visual elements
   */
  useEffect(() => {
    setGridCenterAdjustment({ x: mapPosition.x, y: mapPosition.y });
  }, [mapPosition]);

  /**
   * Converts grid row and column numbers to actual pixel coordinates
   * Adjusts coordinates based on map container position
   * @param {number} rowNum - Grid row number
   * @param {number} colNum - Grid column number
   * @returns {Object} Adjusted x,y coordinates for the grid position
   */
  function rowColNumToGridCoord(rowNum, colNum) {
    const currentGridCenterCoordinate = { ...gridAnchorCoordinates[`${rowNum}-${colNum}`] };
    currentGridCenterCoordinate.x = currentGridCenterCoordinate.x + gridCenterAdjustment.x;
    currentGridCenterCoordinate.y = currentGridCenterCoordinate.y + gridCenterAdjustment.y;
    return currentGridCenterCoordinate;
  };

  /**
   * Effect hook to update character UI state when a character is selected
   * Loads and displays character stats and properties
   */
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

      // Load shared properties based on character type
      const selectedCharProps = sharedProps[selectedCharData.type];
    } else {
      // Reset UI state when no character is selected
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

  // Define terrain layout for the game map
  const terrainData = defineTerrainGrid([
    // Format: [upperLeftX, upperLeftY, lowerRightX, lowerRightY, terrainType]
    [0, 0, 1, 2, 'forest'],     // Forest in top-left 3x3 area
    [1, 0, 2, 2, 'plain'],      // Plain area adjacent to forest
    [3, 0, 5, 1, 'mountain'],   // Mountains in top-right area
    [1, 3, 3, 4, 'water'],      // Water in middle area
    [6, 4, 7, 5, 'wall'],       // Wall in bottom-right corner
  ]);

  /**
   * Checks if a given cell position is currently highlighted
   * Used for movement range visualization
   * @param {number} row - Grid row to check
   * @param {number} col - Grid column to check
   * @returns {boolean} True if the cell is highlighted
   */
  const isCellHighlighted = useCallback((row, col) => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  }, [highlightedCells]);

  /**
   * Checks if a given cell is occupied by any character
   * Used for preventing invalid movements
   * @param {number} row - Grid row to check
   * @param {number} col - Grid column to check
   * @returns {boolean} True if the cell is occupied
   */
  const isOccupiedCell = useCallback((row, col) => {
    return Object.values(characterPositions).some(pos => pos.row === row && pos.col === col);
  }, [characterPositions]);

  /**
   * Filters out occupied cells from a movement range
   * Ensures characters can't move to positions occupied by others
   * @param {Array} movementRange - Array of possible movement positions
   * @returns {Array} Filtered array of valid movement positions
   */
  const filterOccupiedCells = useCallback((movementRange) => {
    return movementRange.filter(cell => !isOccupiedCell(cell.row, cell.col));
  }, [isOccupiedCell]);

  /**
   * Handles grid click events for character selection and movement
   * Manages character selection, movement range calculation, and position updates
   * @param {number} gridY - Clicked grid row
   * @param {number} gridX - Clicked grid column
   */
  const handleGridClick = useCallback((gridY, gridX) => {
    const newState = { gridY, gridX, isMapGrid: true };

    // Check if clicking a highlighted cell and we have a selected character
    if (isCellHighlighted(gridY, gridX) && selectedCharacter) {
      // Update character position
      setCharacterPositions(prev => ({
        ...prev,
        [selectedCharacter]: { row: gridY, col: gridX }
      }));
      
      // Reset states after movement
      setHighlightedCells([]);
      setSelectedCharacter(null);
      setClickedState(null);
      return;
    }

    // Check if any character is at the clicked position
    const characterAtPosition = Object.entries(characterPositions).find(
      ([_, pos]) => pos.row === gridY && pos.col === gridX
    );

    if (characterAtPosition) {
      const [charName, _] = characterAtPosition;
      const char = characterData(charName);
      newState.characterName = charName;
      setSelectedCharacter(charName);

      // Calculate movement range with terrain costs
      const movementRange = calculateMovementRange(
        gridY,
        gridX,
        sharedProps.moveTypes[char.type].distance,
        char.type,
        terrainData
      );
      
      // Filter out cells occupied by other characters
      const validMovementRange = filterOccupiedCells(movementRange).filter(
        cell => !(cell.row === gridY && cell.col === gridX) // Also exclude the current character's position
      );
      
      setHighlightedCells(validMovementRange);
    } else if (!isCellHighlighted(gridY, gridX)) {
      // Only clear selection if clicking a non-highlighted cell
      setHighlightedCells([]);
      setSelectedCharacter(null);
    }

    setClickedState(newState);
    setClickedStateHistory(prev => {
      const newHistory = [newState, ...prev].slice(0, 5);
      return newHistory;
    });
  }, [characterPositions, setSelectedCharacter, terrainData, isCellHighlighted, selectedCharacter, filterOccupiedCells]);

  /**
   * Handles clicks outside the game map
   * Manages deselection and UI state updates for off-map interactions
   * @param {Event} event - Click event object
   */
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

  /**
   * Updates drag-related debug information
   * Tracks cursor position during character dragging
   * @param {Object|null} dragInfo - Contains cursor coordinates or null when drag ends
   */
  const handleDragUpdate = useCallback((dragInfo) => {
    if (!dragInfo) {
      setDraggedOverCell(null);
      return;
    }

    const { cursorX, cursorY } = dragInfo;
  }, []);

  /**
   * Updates the currently dragged-over grid cell
   * Used for visual feedback during character dragging
   * @param {number} row - Grid row being dragged over
   * @param {number} col - Grid column being dragged over
   */
  const handleGridCellDragOver = (row, col) => {
    setDraggedOverCell({ row, col });
  };

  // Main component render
  return (
    <div className={styles['game-container']} onClick={handleContainerClick}>
      <div className={styles['content-wrapper']}>
        {/* Character stats display panel */}
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
        
        {/* Main game map container */}
        <div className={styles['map-container']} ref={mapContainerRef}>
          <GameMap
            onGridClick={handleGridClick}
            ongridAnchorCoordinates={handlegridAnchorCoordinates}
            clickedState={clickedState}
            highlightedCells={highlightedCells}
            terrainData={mapState}
            onCellDragOver={handleGridCellDragOver}
          />
          {/* Render all characters on the map */}
          {characterNames.map((charName) => {
            const gridPos = characterPositions[charName];
            const gridAnchor = gridAnchorCoordinates[`${gridPos.row}-${gridPos.col}`];
            return gridAnchor ? (
              <DraggableCharacter
                key={charName}
                charName={charName}
                coordinates={{
                  x: gridAnchor.x - 32, // Offset to center character sprite
                  y: gridAnchor.y - 64  // Offset to align with grid
                }}
                isSelected={selectedCharacter === charName}
                onDragUpdate={handleDragUpdate}
              />
            ) : null;
          })}
        </div>
        
        {/* Debug information display */}
        {draggedOverCell ? (
          <div className={styles['debug-display']}>
            <pre>
              Drag Debug Info:
              {JSON.stringify({
                draggedOverCell: draggedOverCell || 'none'
              }, null, 2)}
            </pre>
          </div>
        ) : (
          <div className={styles['debug-display']}>
            <div>Clicked Position: {clickedState ? `[${clickedState.gridY},${clickedState.gridX}]` : 'None'}</div>
            <div>Selected Character: {selectedCharacter || 'None'}</div>
            <div>Clicked Character: {clickedState?.characterName || 'None'}</div>
            <div>Is Map Grid: {clickedState?.isMapGrid ? 'Yes' : 'No'}</div>
            <div>History:</div>
            <pre>
              {JSON.stringify(clickedStateHistory, null, 2)}
            </pre>
          </div>
        )}

        {/* Action buttons container */}
        <div className={styles['actionButtonsContainer']}>
          <div className={styles['button-group']}>
            {/* Left-aligned action buttons */}
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
            {/* Right-aligned action buttons */}
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
