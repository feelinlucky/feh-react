/*
 * GameUI.js
 * Main component for the Fire Emblem Heroes game interface
 * Handles character positioning, movement, interactions, and game state management
 */

/* #region Import frameworks */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
/* #endregion */

/* #region Import components */
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
/* #endregion */

// Define path to public assets folder
const publicFolder = `${process.env.PUBLIC_URL}`;


/*
 * DraggableCharacter Component
 * Renders a draggable character sprite on the game map
 * @param {Object} props - Component props
 * @param {string} props.charName - Character's name identifier
 * @param {Object} props.coordinates - X and Y coordinates for character position
 * @param {boolean} props.isSelected - Whether the character is currently selected
 * @param {function} props.setParentIsDragging - Callback to set parent's isDragging state
 */
/* #region DraggableCharacter component */
const DraggableCharacter = ({ charName, coordinates, isSelected, setParentIsDragging }) => {
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
          setParentIsDragging(true);
        },
        onDrag: (event) => {
          if (isDragging) {
            // TODO: add function to calculate nearest grid edge based on cursor position
          }
        },
        onDrop: () => {
          setIsDragging(false);
          setParentIsDragging(false);
        },
        onDragEnd: () => {
          setIsDragging(false);
          setParentIsDragging(false);
        },
      });

      return () => {
        cleanup?.();
      };
    }
  }, [isSelected, charName, isDragging, setParentIsDragging]);

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
/* #endregion */

/*
 * Calculates the grid distance between two characters using Manhattan distance
 * @param {String} charName1 - Name of the first character
 * @param {String} charName2 - Name of the second character
 * @param {Object} gridPos1 - grid row and column of the first position
 * @param {Object} gridPos2 - grid row and column of the second position
 * @param {Object} positions - Object containing character positions
 * @returns {number} The grid distance between the two characters
 */
/* #region calculateCharDistance & calculateGridDistance function */
const calculateGridDistance = (gridPos1, gridPos2) => {
  if (!gridPos1 || !gridPos2) {
    return null;
  }

  // Calculate Manhattan distance (|x1 - x2| + |y1 - y2|)
  return Math.abs(gridPos1.row - gridPos2.row) + Math.abs(gridPos1.col - gridPos2.col);
};

const calculateCharDistance = (positions, charName1, charName2) => {
  const char1Pos = positions[charName1];
  const char2Pos = positions[charName2];
  return calculateGridDistance(char1Pos, char2Pos);
}
/* #endregion */

/*
 * Finds the two nearest edges of a grid cell to the current cursor position.
 * This function adjusts the cursor position based on the GameUI's position 
  * and calculates the distances from the cursor to each edge of the grid cell.
 * 
 * @param { Object } draggedOverGrid - The grid position being dragged over, containing { row, col }.
 * @param { Object } cursorPos - The current position of the cursor in the viewport.
 * @param { Object } gridAnchorCoordinates - Coordinates for each grid cell's center.
  * @param { Object } [gameUIPosition = { x: 0, y: 0 }] - The position of the GameUI component, defaulting to { 0, 0 }.
 * @returns { Array | null } An array containing the two nearest edges(e.g., ['top', 'left'])
  * or null if the grid anchor is not found.
 */
/* #region findNearestGridEdgeToCursor function */
const findNearestGridEdgeToCursor = (
  draggedOverGrid,
  cursorPos,
  gridAnchorCoordinates,
  gameUIPosition = { x: 0, y: 0 }
) => {
  // Adjust cursor position relative to GameUI component's position
  const adjustedCursorPosToMap = {
    x: cursorPos.x - gameUIPosition.x,
    y: cursorPos.y - gameUIPosition.y
  };

  // Get the center coordinates of the current grid cell
  const currentGridAnchor = gridAnchorCoordinates[`${draggedOverGrid.row}-${draggedOverGrid.col}`];

  if (!currentGridAnchor) {
    return null;
  }

  const adjustedCursorPosToGrid = {
    x: adjustedCursorPosToMap.x - currentGridAnchor.x,
    y: adjustedCursorPosToMap.y - currentGridAnchor.y
  };

  // Calculate distances from cursor to each edge of the grid cell
  const CELL_SIZE = 64;
  const halfCell = CELL_SIZE / 2;

  // Compute distances for each edge
  const edgeDistances = {
    top: Math.abs(adjustedCursorPosToGrid.y + halfCell),
    bottom: Math.abs(adjustedCursorPosToGrid.y - halfCell),
    left: Math.abs(adjustedCursorPosToGrid.x + halfCell),
    right: Math.abs(adjustedCursorPosToGrid.x - halfCell)
  };

  // Sort edges by distance
  const sortedEdges = Object.entries(edgeDistances)
    .sort(([, distA], [, distB]) => distA - distB)
    .map(([edge]) => edge);
  // Return the two nearest edges
  return sortedEdges.slice(0, 2);
};
/* #endregion */

/**
 * Calculates the four corner coordinates of a specific grid cell
 * @param {Object} draggedOverGrid - The grid position being dragged over {row, col}
 * @param {Object} gridAnchorCoordinates - Grid anchor coordinates for each cell
 * @returns {Object|null} Object containing top-left, top-right, bottom-left, and bottom-right coordinates
 */
/* #region calculateGridCellCoordinates function  */
const calculateGridCellCoordinates = (draggedOverGrid, gridAnchorCoordinates) => {
  // Get the center coordinates of the current grid cell
  const currentGridAnchor = gridAnchorCoordinates[`${draggedOverGrid.row}-${draggedOverGrid.col}`];

  if (!currentGridAnchor) {
    return null;
  }

  // Assuming each grid cell is roughly 64x64 pixels (standard FEH grid size)
  const CELL_SIZE = 64;
  const halfCell = CELL_SIZE / 2;

  // Calculate corner coordinates
  return {
    topLeft: {
      x: currentGridAnchor.x - halfCell,
      y: currentGridAnchor.y - halfCell
    },
    topRight: {
      x: currentGridAnchor.x + halfCell,
      y: currentGridAnchor.y - halfCell
    },
    bottomLeft: {
      x: currentGridAnchor.x - halfCell,
      y: currentGridAnchor.y + halfCell
    },
    bottomRight: {
      x: currentGridAnchor.x + halfCell,
      y: currentGridAnchor.y + halfCell
    },
    center: currentGridAnchor
  };
};
/* #endregion */

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

  /* #region state management for UI elements and game mechanics */
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
  const [currentCursorPos, setCurrentCursorPos] = useState(null); // Track cursor position for edge detection
  const [isDragging, setIsDragging] = useState(false); // Track dragging state
  const [isCursorObserverActive, setIsCursorObserverActive] = useState(false); // Toggle for cursor observer
  const [isNearestEdgeDisplayActive, setIsNearestEdgeDisplayActive] = useState(false); // Toggle for nearest edge display
  const [isDebugDisplayVisible, setIsDebugDisplayVisible] = useState(true); // State to manage debug display visibility
  /* #endregion */

  /**
   * @param {string} newLog - New log entry to add
   */
  /* #region helper function to update log text chronologically */
  const [logText, setLogText] = useState([
    "Alfonse moved to (2, 3)",
    "Sharena attacked FighterSword",
    "Anna healed Fjorm",
    "Fjorm used special skill"
  ]);

  const updateLogText = (newLog) => {
    setLogText((prevLogText) => {
      const updatedLogText = [newLog, ...prevLogText];
      return updatedLogText.slice(0, 6); // Keep only the latest 6 entries
    });
  };
  /* #endregion */

  /* #region character data and positioning */
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
  /* #endregion */

  /* #region update map and grid coordinates */
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
  /* #endregion */

  /* #region character state and UI */
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
  /* #endregion */

  /* #region cursor position observer */
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isCursorObserverActive) {
        setCurrentCursorPos({
          x: Math.round(event.clientX),
          y: Math.round(event.clientY)
        });
      }
    };

    if (isCursorObserverActive) {
      window.addEventListener('mousemove', handleMouseMove);
      console.log('Cursor observer activated');
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isCursorObserverActive]);

  // Toggle cursor observer
  const toggleCursorObserver = () => {
    setIsCursorObserverActive(!isCursorObserverActive);
    if (!isCursorObserverActive) {
      setCurrentCursorPos(null); // Reset cursor position when turning off
    }
  };
  /* #endregion */

  /* #region initialize map stats */
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

  // Define terrain layout for the game map
  const terrainData = defineTerrainGrid([
    // Format: [upperLeftX, upperLeftY, lowerRightX, lowerRightY, terrainType]
    [0, 0, 1, 2, 'forest'],     // Forest in top-left 3x3 area
    [1, 0, 2, 2, 'plain'],      // Plain area adjacent to forest
    [3, 0, 5, 1, 'mountain'],   // Mountains in top-right area
    [1, 3, 3, 4, 'water'],      // Water in middle area
    [6, 4, 7, 5, 'wall'],       // Wall in bottom-right corner
  ]);
  /* #endregion */

  /* #region handle clicks outside map */
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
  /* #endregion */

  /* #region maintain and check map state during click and drag events */
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
   * Handles grid click events for character selection and movement
   * Manages character selection, movement range calculation, and position updates
   * @param {number} gridY - Clicked grid row
   * @param {number} gridX - Clicked grid column
   */
  const handleGridClick = useCallback((gridY, gridX) => {
    const newState = { gridY, gridX, isMapGrid: true };

    // Check if clicking a highlighted cell and we have a selected character
    if (isCellHighlighted(gridY, gridX) && selectedCharacter) {
      // If the cell is occupied by another character, find the nearest empty cell
      if (isOccupiedCell(gridY, gridX)) {
        // Use a fallback cursor position if not available
        const fallbackCursorPos = currentCursorPos || {
          x: gridAnchorCoordinates[`${gridY}-${gridX}`]?.x || 0,
          y: gridAnchorCoordinates[`${gridY}-${gridX}`]?.y || 0
        };

        const nearestGridEdges = findNearestGridEdgeToCursor(
          { row: gridY, col: gridX },
          fallbackCursorPos,
          gridAnchorCoordinates,
          mapPosition
        );

        // Find the nearest valid and unoccupied grid cell
        const validNeighborGrids = nearestGridEdges.map(edge => {
          switch (edge) {
            case 'top':
              return { row: gridY - 1, col: gridX };
            case 'bottom':
              return { row: gridY + 1, col: gridX };
            case 'left':
              return { row: gridY, col: gridX - 1 };
            case 'right':
              return { row: gridY, col: gridX + 1 };
            default:
              return null;
          }
        }).filter(pos => pos && !isOccupiedCell(pos.row, pos.col));

        if (validNeighborGrids.length > 0) {
          const selectedValidNeighborGrid = validNeighborGrids[0];
          setCharacterPositions(prev => ({
            ...prev,
            [selectedCharacter]: selectedValidNeighborGrid
          }));
        }
      } else {
        // Update character position
        setCharacterPositions(prev => ({
          ...prev,
          [selectedCharacter]: { row: gridY, col: gridX }
        }));
      }

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

      setHighlightedCells(movementRange);
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
  }, [characterPositions, setSelectedCharacter, terrainData, isCellHighlighted, selectedCharacter, currentCursorPos, gridAnchorCoordinates, mapPosition]);

  /**
   * Updates drag-related debug information
   * Tracks cursor position during character dragging
   * @param {Object|null} dragInfo - Contains cursor coordinates or null when drag ends
   */
  const handleDragUpdate = useCallback((dragInfo) => {
    if (!dragInfo) {
      setDraggedOverCell(null);
      setIsDragging(false);
      return;
    }

    const { cursorX, cursorY } = dragInfo;
    setIsDragging(true);
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
  /* #endregion */

  /* #region debug display toggles */
  // Toggle nearest edge display
  const toggleNearestEdgeDisplay = () => {
    setIsNearestEdgeDisplayActive(!isNearestEdgeDisplayActive);
  };

  // Toggle debug display visibility
  const toggleDebugDisplay = () => {
    setIsDebugDisplayVisible(!isDebugDisplayVisible);
  };
  /* #endregion */

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
                  x: gridAnchor.x - 0, // Offset to center character sprite
                  y: gridAnchor.y + 64  // Offset to align with grid
                }}
                isSelected={selectedCharacter === charName}
                setParentIsDragging={setIsDragging}
              />
            ) : null;
          })}
        </div>

        {/* Debug information display */}
        <div className={styles['debug-display']}>
          <button
            onClick={toggleDebugDisplay}
            style={{
              padding: '5px 10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            {isDebugDisplayVisible ? 'Collapse Debug Info' : 'Expand Debug Info'}
          </button>
          {isDebugDisplayVisible && (
            <>
              {draggedOverCell ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      onClick={toggleCursorObserver}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: isCursorObserverActive ? '#4CAF50' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cursor Observer: {isCursorObserverActive ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={toggleNearestEdgeDisplay}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: isNearestEdgeDisplayActive ? '#4CAF50' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Nearest Edge: {isNearestEdgeDisplayActive ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <pre>
                    Drag Debug Info:
                    {JSON.stringify({
                      cursorObserver: {
                        active: isCursorObserverActive,
                        position: currentCursorPos || 'none'
                      },
                      draggedOverCell: draggedOverCell || 'none',
                      nearestEdge: (isNearestEdgeDisplayActive && currentCursorPos && draggedOverCell) ?
                        findNearestGridEdgeToCursor(draggedOverCell, currentCursorPos, gridAnchorCoordinates, mapPosition) : 'none',
                      inputVariables: {
                        draggedOverGrid: draggedOverCell,
                        cursorPos: currentCursorPos ? {
                          original: currentCursorPos,
                          adjusted: {
                            x: currentCursorPos.x - mapPosition.x,
                            y: currentCursorPos.y - mapPosition.y
                          },
                          adjustedToGrid: draggedOverCell && gridAnchorCoordinates ? {
                            x: currentCursorPos.x - mapPosition.x - gridAnchorCoordinates[`${draggedOverCell.row}-${draggedOverCell.col}`].x,
                            y: currentCursorPos.y - mapPosition.y - gridAnchorCoordinates[`${draggedOverCell.row}-${draggedOverCell.col}`].y
                          } : 'none'
                        } : 'none',
                        mapPosition: mapPosition
                      }
                    }, null, 2)}
                  </pre>
                  <pre>
                    Grid Cell Coordinates:
                    {JSON.stringify(calculateGridCellCoordinates(draggedOverCell, gridAnchorCoordinates), null, 2)}
                  </pre>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      onClick={toggleCursorObserver}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: isCursorObserverActive ? '#4CAF50' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cursor Observer: {isCursorObserverActive ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={toggleNearestEdgeDisplay}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: isNearestEdgeDisplayActive ? '#4CAF50' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Nearest Edge: {isNearestEdgeDisplayActive ? 'ON' : 'OFF'}
                    </button>
                  </div>
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
            </>
          )}
        </div>

        {/* Log text display container */}
        <div className={styles['log-text-container']}>
          <div className={styles['log-text-header']}>Log</div>
          <div className={styles['log-text-content']}>
            {logText.map((log, index) => (
              <div key={index} className={styles['log-text-item']}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
