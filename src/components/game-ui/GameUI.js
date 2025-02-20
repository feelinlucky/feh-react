import React, { Component, useEffect, useState, useCallback, useRef } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import CharacterStatUI from '../character-stat-ui/CharacterStatUI';
import Sprite from '../sprite/Sprite';
import { createTurnState } from './TurnState';
import GameMap, {
  findNearestNeighbors,
  findNearestGrids,
  defineTerrainGrid,
  TerrainType,
  calculateMovementRange,
  findShortestPath
} from '../game-map/GameMap';

import { sharedProps, characterData } from '../character-data/CharacterData';
import { characterInteraction, printInteractionResult, applyActionResult, printCharacterState } from '../character-data/CharacterInteraction';
import MapCharacter from '../map-character/MapCharacter';
import LogTextContainer from '../log-text-container/LogTextContainer';

import { useSpring, animated } from 'react-spring';

const publicFolder = `${process.env.PUBLIC_URL}`;

const DraggableCharacter = ({
  charName,
  coordinates,
  isSelected,
  setParentIsDragging,
  setSelectedCharacter,
  setHighlightedCells,
  setNearestGridEdges,
  charPositions,
  gridAnchorCoordinates,
  mapPosition,
  terrainData,
  isOccupiedCell,
  setCharacterPositions,
  updateLogText,
  handleGridClick
}) => {
  const overlayRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDraggedOverCell, setCurrentDraggedOverCell] = useState((charPositions ? [charName] : null));

  useEffect(() => {
    const el = overlayRef.current;
    if (el) {
      const cleanup = draggable({
        element: el,
        data: {
          character: charName,
        },
        onDragStart: (event) => {
          setIsDragging(true);
          setParentIsDragging(true);

          if (!isSelected) {
            setSelectedCharacter(charName);
            const selectedCharState = characterData(charName);
            const gridPos = charPositions[charName];
            const movementRange = calculateMovementRange(
              gridPos.row,
              gridPos.col,
              sharedProps.moveTypes[selectedCharState.type].distance,
              selectedCharState.type,
              terrainData
            );
            setHighlightedCells(movementRange);
          }
        },
        onDrag: (event) => {
          if (isDragging) {
            const cursorPos = { x: event.clientX, y: event.clientY };

            const isWithinBounds = cursorPos.x >= mapPosition.x && cursorPos.x <= mapPosition.x + 512 && cursorPos.y >= mapPosition.y && cursorPos.y <= mapPosition.y + 512;
            const draggedOverCell = findGridCellByCursor(cursorPos, gridAnchorCoordinates);

            if (!isWithinBounds || !draggedOverCell) {
              setCurrentDraggedOverCell(null);
              return;
            };

            setCurrentDraggedOverCell(draggedOverCell);

            if (draggedOverCell && isOccupiedCell(draggedOverCell.row, draggedOverCell.col) && charPositions[charName] !== draggedOverCell) {
              setDraggedOverCellColor(draggedOverCell, 'rgba(0, 0, 255, 0.5)');
            } else {
              setDraggedOverCellColor(draggedOverCell, 'rgba(255, 0, 0, 0.5)');
            }
          }
        },
        onDrop: (event) => {
          setIsDragging(false);
          setParentIsDragging(false);

          if (!currentDraggedOverCell) {
            const cursorPos = { x: event.clientX, y: event.clientY };

            const isWithinBounds = cursorPos.x >= mapPosition.x && cursorPos.x <= mapPosition.x + 512 && cursorPos.y >= mapPosition.y && cursorPos.y <= mapPosition.y + 512;
            const draggedOverCell = findGridCellByCursor(cursorPos, gridAnchorCoordinates);

            if (!isWithinBounds || !draggedOverCell) {
              setCurrentDraggedOverCell(null);
              return;
            };

            setCurrentDraggedOverCell(draggedOverCell);
          }
          handleGridClick(event, currentDraggedOverCell.row, currentDraggedOverCell.col);
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
  }, [
    isSelected,
    charName,
    isDragging,
    setParentIsDragging,
    setSelectedCharacter,
    setHighlightedCells,
    setNearestGridEdges,
    charPositions,
    gridAnchorCoordinates,
    mapPosition,
    terrainData,
    isOccupiedCell,
    setCharacterPositions,
    updateLogText
  ]);

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

const AnimatedCharacter = ({ charName, coordinates, isSelected, ...props }) => {
  const { x, y } = useSpring({
    to: { x: coordinates.x, y: coordinates.y },
    config: { tension: 300, friction: 20 }
  });

  return (
    <animated.div
      style={{
        position: 'absolute',
        left: x.to(val => `${val}px`),
        top: y.to(val => `${val}px`),
        cursor: isSelected ? 'grab' : 'pointer',
        userSelect: 'none',
      }}
      data-dragging={props.isDragging}
    >
      <MapCharacter characterName={charName} />
    </animated.div>
  );
};

const findGridCellByCursor = (cursorPos, gridAnchorCoordinates) => {
  for (const key in gridAnchorCoordinates) {
    const [row, col] = key.split('-').map(Number);
    const anchor = gridAnchorCoordinates[key];
    const diameter = 50;
    // console.log(`Checking grid cell at row ${row}, col ${col} with anchor`, anchor);
    if (
      cursorPos.x >= anchor.x - diameter && cursorPos.x <= anchor.x + diameter &&
      cursorPos.y >= anchor.y - diameter && cursorPos.y <= anchor.y + diameter
    ) {
      // console.log(`Cursor is within grid cell at row ${row}, col ${col}`);
      return { row, col };
    }
  }
  // console.log('Cursor is not within any grid cell');
  return null;
};

const calculateDistance = (point1, point2) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
};

const setDraggedOverCellColor = (cell, color) => {
  const cellElement = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
  if (cellElement) {
    cellElement.style.backgroundColor = color;
  }
};

const findCharacterNameByGridPosition = (gridPos, charPositions) => {
  for (const charName in charPositions) {
    if (charPositions[charName].row === gridPos.row && charPositions[charName].col === gridPos.col) {
      return charName;
    }
  }
};

const calculateGridDistance = (gridPos1, gridPos2) => {
  if (!gridPos1 || !gridPos2) {
    return null;
  }

  return Math.abs(gridPos1.row - gridPos2.row) + Math.abs(gridPos2.col - gridPos2.col);
};

const calculateCharDistance = (positions, charName1, charName2) => {
  const char1Pos = positions[charName1];
  const char2Pos = positions[charName2];
  return calculateGridDistance(char1Pos, char2Pos);
}

const calculateGridCellCoordinates = (draggedOverGrid, gridAnchorCoordinates) => {
  const currentGridAnchor = gridAnchorCoordinates[`${draggedOverGrid.row}-${draggedOverGrid.col}`];

  if (!currentGridAnchor) {
    return null;
  }

  const CELL_SIZE = 64;
  const halfCell = CELL_SIZE / 2;

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

const DamageNumber = ({ damage, position, onAnimationEnd }) => {
  const displayTime = 5000;
  const springProps = useSpring({
    from: {
      opacity: 1,
      transform: 'translateY(0px)'
    },
    to: {
      opacity: 0,
      transform: 'translateY(-30px)'
    },
    config: { duration: displayTime, tension: 120, friction: 14 },
    onRest: onAnimationEnd,
  });

  useEffect(() => {
    const timer = setTimeout(onAnimationEnd, displayTime);
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <animated.div
      style={{
        ...springProps,
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#ffffff', // White text
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Black background with transparency
        padding: '2px 4px', // Padding for better visibility
        borderRadius: '4px', // Rounded corners
        textShadow: '2px 2px 2px rgba(0,0,0,0.5)', // Shadow for text
        zIndex: 1000,
      }}
    >
      {damage}
    </animated.div>
  );
};


const GameUI = () => {
  const location = useLocation();
  const frontPageState = location.state || {};

  const [selectedCharState, setSelectedCharState] = useState({});

  const defaultClickState = {
    gridY: null,
    gridX: null,
    isMapGrid: false,
    characterName: null,
    clickEvent: null,
    selectedCharacterIsActive: false
  };

  const [clickedState, setClickedState] = useState(defaultClickState);
  const [clickedStateHistory, setClickedStateHistory] = useState([]);
  const [damageNumbers, setDamageNumbers] = useState([]);

  const updateClickedState = ({ gridY, gridX, isMapGrid, characterName, clickEvent }) => {
    // Create base click state
    const clickedCharState = allyStates[characterName] || foeStates[characterName];
    const currentActiveGroupIsAlly = turnState.currentActiveGroupIsAlly();
    const selectedCharacterIsActive = characterName ? (
      (clickedCharState?.isAlly && currentActiveGroupIsAlly) ||
      (!clickedCharState?.isAlly && !currentActiveGroupIsAlly)
    ) : false;


    const clickState = {
      ...defaultClickState,
      gridY: typeof gridY === 'number' ? gridY : null,
      gridX: typeof gridX === 'number' ? gridX : null,
      isMapGrid: Boolean(isMapGrid),
      characterName: characterName || null,
      clickEvent: clickEvent || null,
      selectedCharacterIsActive: selectedCharacterIsActive
    };

    // Update current click state
    setClickedState(clickState);

    // Update click history
    setClickedStateHistory(prev => {
      const newHistory = [clickState, ...prev].slice(0, 5);
      return newHistory;
    });

    return clickState;
  };

  const rollbackToPreviousClickState = () => {
    const previousClickState = clickedStateHistory[1];
    if (previousClickState) {
      setClickedState(previousClickState);
    }
  };

  const [gridAnchorCoordinates, setgridAnchorCoordinates] = useState({});
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);
  const [gridCenterAdjustment, setGridCenterAdjustment] = useState({ x: 0, y: 0 });
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);
  const [draggedOverCell, setDraggedOverCell] = useState(null);
  const [currentCursorPos, setCurrentCursorPos] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCursorObserverActive, setIsCursorObserverActive] = useState(false);
  const [isDebugDisplayVisible, setIsDebugDisplayVisible] = useState(true);
  const [nearestGridEdges, setNearestGridEdges] = useState([]);
  const [errorLogging, setErrorLogging] = useState([]);
  const [logText, setLogText] = useState([
    { text: "Alfonse moved to (2, 3)", category: "movement" },
    { text: "Sharena attacked FighterSword", category: "combat" },
    { text: "Anna healed Fjorm", category: "healing" },
    { text: "Fjorm used special skill", category: "skill" }
  ]);

  // const terrainData = defineTerrainGrid([
  //   [0, 0, 1, 2, 'forest'],
  //   [1, 0, 2, 2, 'plain'],
  //   [3, 0, 5, 1, 'mountain'],
  //   [1, 3, 3, 4, 'water'],
  //   [6, 4, 7, 5, 'wall'],
  // ]);
  const [mapState, setMapState] = useState(frontPageState.mapData || { terrain: [] });

  const allyNames = ["Alfonse", "Sharena", "Anna", "Fjorm"];
  const foeNames = ["FighterSword"];
  const characterNames = [...allyNames, ...foeNames];

  const [allyStates, setAllyStates] = useState(
    allyNames.reduce((acc, name) => {
      acc[name] = { ...characterData(name), group: 'ally', hasMoved: false, hasActed: false, turnEnded: false };
      return acc;
    }, {})
  );

  const [foeStates, setFoeStates] = useState(
    foeNames.reduce((acc, name) => {
      acc[name] = { ...characterData(name), group: 'foe', hasMoved: false, hasActed: false, turnEnded: false };
      return acc;
    }, {})
  );

  const terrainData = defineTerrainGrid(mapState?.terrain || []);
  const allyPos = mapState?.allyPos || [];
  const foePos = mapState?.foePos || [];
  const pairTextArrayWith2DArray = (textArray, array2D) => {
    return textArray.map((text, index) => {
      return {
        text,
        position: array2D[index]
      };
    });
  };

  const allyPositions = pairTextArrayWith2DArray(allyNames, allyPos);
  const foePositions = pairTextArrayWith2DArray(foeNames, foePos);
  const initialCharPositions = {
    ...allyPositions.reduce((acc, { text, position }) => {
      if (position) {
        acc[text] = { row: position[1], col: position[0] };
      }
      return acc;
    }, {}),
    ...foePositions.reduce((acc, { text, position }) => {
      if (position) {
        acc[text] = { row: position[1], col: position[0] };
      }
      return acc;
    }, {})
  };

  const [charPositions, setCharacterPositions] = useState(
    initialCharPositions
  );

  const [showTerrainOverlay, setShowTerrainOverlay] = useState(false);

  const [activeTab, setActiveTab] = useState("categorized");

  const updateLogText = useCallback((newLog, category = "uncategorized") => {
    setLogText((prevLogText) => {
      const updatedLogText = [{ text: newLog, category }, ...prevLogText];
      return updatedLogText.slice(0, 6);
    });
  }, []);

  // Track whether the current group is draggable
  const [isDraggable, setIsDraggable] = useState(true);

  // turn state hooks
  const handleTurnStart = (turnNumber) => {
    updateLogText(`Turn ${turnNumber} started`, 'event');
  };

  const handleTurnEnd = (turnNumber) => {
    updateLogText(`Turn ${turnNumber} ended`, 'event');
  };

  const handleGroupSwitch = () => {
    let isAllyTurn = turnState.currentActiveGroupIsAlly();
    setIsDraggable(isAllyTurn);
    updateLogText(`Switched to ${isAllyTurn ? 'ally' : 'foe'} turn`, 'event');
  };

  const turnState = useRef(createTurnState(
    allyStates,
    foeStates,
    {
      onTurnStart: handleTurnStart,
      onTurnEnd: handleTurnEnd,
      onGroupSwitch: handleGroupSwitch
    }
  )).current;

  useEffect(() => {
    updateLogText(`initialized current active group to ${turnState.currentActiveGroupIsAlly() ? 'ally' : 'foe'}`, 'event');
  }, [turnState, updateLogText]);

  useEffect(() => {
    if (!mapState) {
      console.error('No map data provided! Returning to FrontPage.');
      // Handle missing map data, e.g., redirect back to FrontPage
    }
  }, [mapState]);

  const handlegridAnchorCoordinates = useCallback((gridAnchorCoordinates) => {
    setgridAnchorCoordinates(gridAnchorCoordinates);
  }, []);

  useEffect(() => {
    const updateMapPosition = () => {
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        setMapPosition({ x: rect.left, y: rect.top });
      }
    };

    updateMapPosition();

    const observer = new ResizeObserver(() => {
      updateMapPosition();
    });

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    window.addEventListener('resize', updateMapPosition);

    return () => {
      window.removeEventListener('resize', updateMapPosition);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setGridCenterAdjustment({ x: mapPosition.x, y: mapPosition.y });
  }, [mapPosition]);

  useEffect(() => {
    if (selectedCharacter && (selectedCharacter !== selectedCharState.name)) {
      const selectedCharData = allyStates[selectedCharacter] || foeStates[selectedCharacter];
      setSelectedCharState({ ...selectedCharData });
    };
  }, [selectedCharacter, allyStates, foeStates, setSelectedCharState]);

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
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isCursorObserverActive]);

  const toggleCursorObserver = () => {
    setIsCursorObserverActive(!isCursorObserverActive);
    if (!isCursorObserverActive) {
      setCurrentCursorPos(null);
    }
  };

  function rowColNumToGridCoord(rowNum, colNum) {
    const currentGridCenterCoordinate = { ...gridAnchorCoordinates[`${rowNum}-${colNum}`] };
    currentGridCenterCoordinate.x = currentGridCenterCoordinate.x + gridCenterAdjustment.x;
    currentGridCenterCoordinate.y = currentGridCenterCoordinate.y + gridCenterAdjustment.y;
    return currentGridCenterCoordinate;
  };

  function closestPointToCursorFinder(points, cursorPos) {
    // Validate inputs
    if (!cursorPos || !points || points.length === 0) {
      return null;
    }

    // Validate cursor position
    if (typeof cursorPos.x !== 'number' || typeof cursorPos.y !== 'number') {
      console.warn('closestPointToCursorFinder: Invalid cursor position', cursorPos);
      return null;
    }

    // Validate points
    const validPoints = points.filter(point =>
      point &&
      typeof point.x === 'number' &&
      typeof point.y === 'number'
    );

    if (validPoints.length === 0) {
      console.warn('closestPointToCursorFinder: No valid points', points);
      return null;
    }

    // Find the point with the minimum distance to the cursor
    return validPoints.reduce((closest, point) => {
      const currentDistance = calculateDistance(cursorPos, point);
      const closestDistance = calculateDistance(cursorPos, closest);

      return currentDistance < closestDistance ? point : closest;
    }, validPoints[0]);
  }

  const handleContainerClick = useCallback((containerClickEvent) => {

    if (containerClickEvent.target.closest(`.${styles['map-container']}`)) {
      return;
    }
    updateClickedState({ gridY: 0, gridX: 0, isMapGrid: false, characterName: null, clickedComponent: containerClickEvent.currentTarget });
    resetSelectState({ resetClickedState: false, resetSelectedCharacter: true, resetHighlightedCells: true });
  }, [setClickedState, setSelectedCharacter]);

  const isCellHighlighted = useCallback((row, col) => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  }, [highlightedCells]);

  const isOccupiedCell = useCallback((row, col) => {
    return Object.values(charPositions).some(pos => pos.row === row && pos.col === col);
  }, [charPositions]);

  function resetSelectState({ resetClickedState, resetSelectedCharacter, resetHighlightedCells }) {
    if (resetClickedState) {
      setClickedState(defaultClickState);
    }

    if (resetSelectedCharacter) {
      setSelectedCharacter(null);
    }

    if (resetHighlightedCells) {
      setHighlightedCells([]);
    }
    return;
  };

  // Update turn state after each character action
  const updateTurnState = useCallback(({ characterName, justMoved, justActed }) => {
    if (justActed) {
      turnState.hasActed(characterName);
    }

    if (justMoved) {
      turnState.hasMoved(characterName);
    }
  }, [turnState]);

  const [mapClickMode, setMapClickMode] = useState('null');

  const getMapClickMode = (newClickedState, selectedCharacter, clickedCharacter) => {
    // If the clicked state is not a map grid, return 'null'
    if (!newClickedState.isMapGrid) {
      return 'null';
    }

    // If a character is selected
    if (selectedCharacter) {
      const sameCharisClicked = selectedCharacter === clickedCharacter;
      const characterTurnState = turnState.getCharacterTurnState(selectedCharacter);

      // Check if the character is valid and belongs to the current group
      if (!characterTurnState) {
        console.error(`Character ${selectedCharacter} not found in current group.`);
        return 'null';
      }

      const hasActed = characterTurnState.hasActed;
      const hasMoved = characterTurnState.hasMoved;

      // Highlighted cell interaction
      if (highlightedCells && (highlightedCells.length > 0)) {

        if (isCellHighlighted(newClickedState.gridY, newClickedState.gridX)) {
          if (isOccupiedCell(newClickedState.gridY, newClickedState.gridX)) {
            // If the cell is occupied, check if it's the same character
            if (sameCharisClicked) {
              if (hasActed) {
                return 'switch_selected';
              }
              return 'invalid_click';
            }
            if (hasActed) {
              return 'switch_selected'; // Can't interact if already acted
            }
            return 'move_and_interact'; // Move to occupied cell to interact
          }
          if (hasMoved) {
            return 'switch_selected'; // Can't interact if already acted
          }
          return 'move_to_empty_grid'; // Valid move to an empty cell              
        }
        if (hasActed) {
          return 'invalid_click';
        }
        return 'invalid_move'; // No action needed if not highlighted
      }
      return 'invalid_move';
    }

    // If no character is selected, just switch selection
    return 'switch_selected';
  };

  const filterOccupiedCells = (gridCells, charPositions) => {
    const occupiedCells = Object.values(charPositions);
    return gridCells.filter(({ row, col }) =>
      !occupiedCells.some(pos => pos.row === row && pos.col === col)
    );
  };

  const handleGridClick = useCallback((gridClickEvent, gridY, gridX) => {

    const characterAtPosition = Object.entries(charPositions).find(
      ([_, pos]) => pos.row === gridY && pos.col === gridX
    );
    let clickedCharacter = characterAtPosition ? characterAtPosition[0] : null;
    if (clickedCharacter === selectedCharacter) {
      clickedCharacter = null;
    }
    const newClickedState = updateClickedState({
      gridY: gridY,
      gridX: gridX,
      isMapGrid: true,
      characterName: clickedCharacter,
      clickEvent: gridClickEvent.currentTarget
    });

    // determine map click state
    const mode = getMapClickMode(newClickedState, selectedCharacter, clickedCharacter);
    setMapClickMode(mode);
    updateLogText(`Clicked at (${gridY}, ${gridX}), mode: ${mode}`, 'event');
    switch (mode) {
      case 'null':
        resetSelectState({ resetClickedState: false, resetSelectedCharacter: true, resetHighlightedCells: true });
        return;
      case 'move_and_interact':
        const selectedCharData = allyStates[selectedCharacter] || foeStates[selectedCharacter] || null;
        const clickedCharacterStates = allyStates[clickedCharacter] || foeStates[clickedCharacter] || null;
        if (!selectedCharData || !clickedCharacterStates) {
          return;
        }

        const actionResult = characterInteraction(selectedCharData, clickedCharacterStates);
        if (actionResult.error || !actionResult) {
          console.error(`Error: ${actionResult.error}`);
          rollbackToPreviousClickState();
          return;
        } else {
          // Implement movement after interaction
          const interactionRange = actionResult.range ? actionResult.range : 0;
          const selectedCharPos = charPositions[selectedCharacter];

          const areaGrids = [...highlightedCells];
          const validMoveGrids = findNearestGrids(gridY, gridX, interactionRange, areaGrids);
          setHighlightedCells(validMoveGrids);

          // Find nearest valid move grid after action is taken
          const nearestAfterActionMoveGrids = findNearestNeighbors(selectedCharPos, { row: gridY, col: gridX });

          if (nearestAfterActionMoveGrids.length) {
            let closestGrid = null;
            for (const grid of nearestAfterActionMoveGrids) {
              if (!isOccupiedCell(grid.row, grid.col)) {
                closestGrid = grid;
                break;
              }
            };

            if (closestGrid) {
              setCharacterPositions(prev => ({
                ...prev,
                [selectedCharacter]: { row: closestGrid.row, col: closestGrid.col }
              }));
            };
          };

          updateLogText(printInteractionResult(actionResult), 'interaction');
          // TODO: add handle damage number in actionResult.
          handleDamageNumbers(actionResult);

          const { updatedActiveTurnStates, updatedPassiveTurnStates } = applyActionResult(allyStates, foeStates, actionResult);

          if (actionResult.isAlly) {
            setAllyStates(prevStates => ({
              ...prevStates,
              ...updatedActiveTurnStates
            }));
            setFoeStates(prevStates => ({
              ...prevStates,
              ...updatedPassiveTurnStates
            }));
          } else {
            setFoeStates(prevStates => ({
              ...prevStates,
              ...updatedActiveTurnStates
            }));
            setAllyStates(prevStates => ({
              ...prevStates,
              ...updatedPassiveTurnStates
            }));
          }

          updateTurnState({ characterName: selectedCharacter, justActed: true, justMoved: true });
          resetSelectState({ resetClickedState: true, resetSelectedCharacter: true, resetHighlightedCells: true });
          return;
        };
        return;
      case 'move_to_empty_grid':
        setSelectedCharacter(clickedCharacter);

        const selectedCharPos = charPositions[selectedCharacter];
        const selectedCharMoveType = selectedCharState.type

        const shortestGrids = findShortestPath(
          selectedCharPos.row,
          selectedCharPos.col,
          gridY,
          gridX,
          terrainData,
          selectedCharMoveType
        ) || [];

        if (shortestGrids.length) {
          setCharacterPositions(prev => ({
            ...prev,
            [selectedCharacter]: { row: gridY, col: gridX }
          }));
        };
        updateTurnState({ characterName: selectedCharacter, justActed: true, justMoved: true }) // count as has acted if moving toward empty grid
        resetSelectState({ resetClickedState: true, resetSelectedCharacter: true, resetHighlightedCells: true });
        return;
      case 'switch_selected':
        if (clickedCharacter) {
          setSelectedCharacter(clickedCharacter);
          const selectedCharState = allyStates[clickedCharacter] || foeStates[clickedCharacter];
          if (!selectedCharState) {
            console.error(`Character ${characterAtPosition} not found in current group.`);
            return;
          };
          const movementRange = calculateMovementRange(
            gridY,
            gridX,
            sharedProps.moveTypes[selectedCharState.type].distance,
            selectedCharState.type,
            terrainData
          );
          setHighlightedCells(movementRange);
          return;
        } else {
          resetSelectState({ resetClickedState: false, resetSelectedCharacter: false, resetHighlightedCells: true });
        }
        return;
      case 'invalid_move':
        resetSelectState({ resetClickedState: true, resetSelectedCharacter: true, resetHighlightedCells: true });
        return;
      case 'invalid_click':
        rollbackToPreviousClickState();
        return;
      default:
        console.warn(`Unhandled map click mode: ${mode}`);
        return;
    }
  }, [charPositions, setSelectedCharacter, terrainData, isCellHighlighted, selectedCharacter, currentCursorPos, gridAnchorCoordinates, mapPosition, allyStates, foeStates, updateTurnState]);

  const handleDragUpdate = useCallback((dragInfo) => {
    if (!dragInfo) {
      setDraggedOverCell(null);
      setIsDragging(false);
      return;
    }

    const { cursorX, cursorY } = dragInfo;
    setIsDragging(true);
  }, []);

  const handleGridCellDragOver = (row, col) => {
    setDraggedOverCell({ row, col });
  };

  const toggleDebugDisplay = () => {
    setIsDebugDisplayVisible(!isDebugDisplayVisible);
  };

  useEffect(() => {
    console.log('Ally States Updated:', allyStates);
    console.log('Foe States Updated:', foeStates);
  }, [allyStates, foeStates]);

  const handleDamageNumbers = (actionResult) => {
    if (!actionResult || !actionResult.hitPoints) return;

    const { hitPoints, char2 } = actionResult;

    // Get position for damage number display
    const targetPos = charPositions[char2];
    if (!targetPos) {
      console.error('Target position not found for:', char2);
      return;
    }

    const targetPosCoord = gridAnchorCoordinates[`${targetPos.row}-${targetPos.col}`];
    if (!targetPosCoord) {
      console.error('Grid anchor not found for target position:', targetPos);
      return;
    }

    const newDamageNumber = {
      id: Date.now(),
      damage: hitPoints,
      position: {
        x: targetPosCoord.x,
        y: targetPosCoord.y - 32
      }
    };

    setDamageNumbers((prev) => [...prev, newDamageNumber]);
    // setDamageNumbers(prev => {
    //   const updatedNumbers = [...prev, newDamageNumber];
    //   console.log('Updated damage numbers:', updatedNumbers);
    //   return updatedNumbers;
    // });
  };

  return (
    <div className={styles['game-container']} onClick={handleContainerClick}>
      <div className={styles['content-wrapper']}>
        <CharacterStatUI
          charName={selectedCharState.name}
          level={selectedCharState.level}
          wpnType={selectedCharState.wpnType}
          hp={selectedCharState.hp}
          atk={selectedCharState.atk}
          spd={selectedCharState.spd}
          def={selectedCharState.def}
          res={selectedCharState.res}
          skills={selectedCharState.skills}
        />
        <div className={styles['map-container']} ref={mapContainerRef}>
          <GameMap
            onGridClick={handleGridClick}
            ongridAnchorCoordinates={handlegridAnchorCoordinates}
            clickedState={clickedState}
            highlightedCells={highlightedCells}
            terrainData={terrainData}
            onCellDragOver={handleGridCellDragOver}
            showTerrainOverlay={showTerrainOverlay}
          />
          {characterNames.map((charName) => {
            const gridPos = charPositions[charName];
            if (!gridPos) return null;
            const gridAnchor = gridAnchorCoordinates[`${gridPos.row}-${gridPos.col}`];
            return gridAnchor ? (
              <AnimatedCharacter
                key={charName}
                charName={charName}
                coordinates={{
                  x: gridAnchor.x - 64,
                  y: gridAnchor.y - 64
                }}
                isSelected={selectedCharacter === charName}
                setParentIsDragging={setIsDragging}
                setSelectedCharacter={setSelectedCharacter}
                setHighlightedCells={setHighlightedCells}
                setNearestGridEdges={setNearestGridEdges}
                charPositions={charPositions}
                gridAnchorCoordinates={gridAnchorCoordinates}
                mapPosition={mapPosition}
                terrainData={terrainData}
                isOccupiedCell={isOccupiedCell}
                setCharacterPositions={setCharacterPositions}
                updateLogText={updateLogText}
                handleGridClick={handleGridClick}
              />
            ) : null;
          })}

          {damageNumbers.map(({ id, damage, position }) => (
            <DamageNumber
              key={id}
              damage={damage}
              position={position}
              onAnimationEnd={() => {
                setDamageNumbers((prev) => prev.filter((item) => item.id !== id));
              }}
            />
          ))}

        </div>
        <LogTextContainer
          logText={logText}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          errorLogging={errorLogging}
          setErrorLogging={setErrorLogging}
          draggedOverCell={draggedOverCell}
          toggleCursorObserver={toggleCursorObserver}
          isCursorObserverActive={isCursorObserverActive}
          currentCursorPos={currentCursorPos}
          mapPosition={mapPosition}
          gridAnchorCoordinates={gridAnchorCoordinates}
          calculateGridCellCoordinates={calculateGridCellCoordinates}
          clickedState={clickedState}
          selectedCharacter={selectedCharacter}
          clickedStateHistory={clickedStateHistory}
          showTerrainOverlay={showTerrainOverlay}
          setShowTerrainOverlay={setShowTerrainOverlay}
          isDebugDisplayVisible={isDebugDisplayVisible}
          toggleDebugDisplay={toggleDebugDisplay}
          turnState={turnState}
        />
      </div>
    </div>
  );
};

export default GameUI;