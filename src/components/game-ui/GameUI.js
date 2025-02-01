import React, { Component, useEffect, useState, useCallback, useRef } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import CharacterStatUI from '../character-stat-ui/CharacterStatUI';
import Sprite from '../sprite/Sprite';
import { createTurnState } from './TurnState';
import GameMap, {
  findNearestGrids,
  defineTerrainGrid,
  TerrainType,
  calculateMovementRange
} from '../game-map/GameMap';

import { sharedProps, characterData } from '../character-data/CharacterData';
import { characterInteraction, printInteractionResult } from '../character-data/CharacterInteraction';
import MapCharacter from '../map-character/MapCharacter';
import LogTextContainer from '../log-text-container/LogTextContainer';

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
  updateLogText
}) => {
  const overlayRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDraggedOverCell, setCurrentDraggedOverCell] = useState(null);

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

            if (!isWithinBounds && draggedOverCell) {
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

          if (currentDraggedOverCell) {
            const selectedValidNeighborGrid = currentDraggedOverCell;

            setCharacterPositions(prev => ({
              ...prev,
              [charName]: selectedValidNeighborGrid
            }));

            updateLogText(`${charName} moved to (${selectedValidNeighborGrid.row}, ${selectedValidNeighborGrid.col})`);
          } else {
            updateLogText(`${charName} could not move to an occupied grid`);
          }
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

const findGridCellByCursor = (cursorPos, gridAnchorCoordinates) => {
  for (const key in gridAnchorCoordinates) {
    const [row, col] = key.split('-').map(Number);
    const anchor = gridAnchorCoordinates[key];
    if (
      cursorPos.x >= anchor.x - 32 && cursorPos.x <= anchor.x + 32 &&
      cursorPos.y >= anchor.y - 32 && cursorPos.y <= anchor.y + 32
    ) {
      return { row, col };
    }
  }
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

const GameUI = () => {
  const location = useLocation();
  const frontPageState = location.state || {};

  const [selectedCharState, setselectedCharState] = useState({});
  const [clickedState, setClickedState] = useState(null);
  const [clickedStateHistory, setClickedStateHistory] = useState([]);

  const createClickedState = ({ gridY, gridX, isMapGrid, characterName, clickEvent }) => {
    // Create base click state
    const clickState = {
      gridY: typeof gridY === 'number' ? gridY : null,
      gridX: typeof gridX === 'number' ? gridX : null,
      isMapGrid: Boolean(isMapGrid),
      characterName: characterName || null,
      clickEvent: clickEvent || null
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

  const defaultClickState = {
    gridY: null,
    gridX: null,
    isMapGrid: false,
    characterName: null
  };

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

  const categorizedLogs = logText.filter(log => log.category !== "uncategorized");
  const uncategorizedLogs = logText.filter(log => log.category === "uncategorized");

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
  }, [mapState]);

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
    if (selectedCharacter) {
      const selectedCharData = allyStates[selectedCharacter] || foeStates[selectedCharacter];
      setselectedCharState({ ...selectedCharData });
    } else {
      setselectedCharState({
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
  }, [selectedCharacter, allyStates, foeStates, setselectedCharState]);

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

  const handleContainerClick = useCallback((containerClickEvent) => {

    if (containerClickEvent.target.closest(`.${styles['map-container']}`)) {
      return;
    }
    createClickedState({ gridY: 0, gridX: 0, isMapGrid: false, characterName: null, clickedComponent: containerClickEvent.currentTarget });
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
        console.log('highlightedCells:', highlightedCells);

        if (isCellHighlighted(newClickedState.gridY, newClickedState.gridX)) {
          if (isOccupiedCell(newClickedState.gridY, newClickedState.gridX)) {
            // If the cell is occupied, check if it's the same character
            if (selectedCharacter === clickedCharacter) {
              return 'null'; // No action needed if clicking on self
            }
            if (hasActed) {
              return 'switch_selected'; // Can't interact if already acted
            }
            return 'move_and_interact'; // Move to occupied cell to interact
          }
          if (hasMoved) {
            return 'switch_selected'; // Can't interact if already acted
          }
          return 'move'; // Valid move to an empty cell              
        }
        return 'invalid_move'; // No action needed if not highlighted
      }
      return 'invalid_move';
    }

    // If no character is selected, just switch selection
    return 'switch_selected';
  };

  const handleGridClick = useCallback((gridClickEvent, gridY, gridX) => {
    createClickedState({
        gridY,
        gridX,
        isMapGrid: true,
        characterName: null,
        clickEvent: gridClickEvent
    });
    
    const characterAtPosition = Object.entries(charPositions).find(
      ([_, pos]) => pos.row === gridY && pos.col === gridX
    );
    const clickedCharacter = characterAtPosition ? characterAtPosition[0] : null;

    const newClickedState = createClickedState({ gridY: gridY, gridX: gridX, isMapGrid: true, characterName: clickedCharacter, clickedComponent: gridClickEvent.currentTarget });

    // determine map click state
    const mode = getMapClickMode(newClickedState, selectedCharacter, clickedCharacter);
    setMapClickMode(mode);
    switch (mode) {
      case 'null':
        resetSelectState({ resetClickedState: false, resetSelectedCharacter: true, resetHighlightedCells: true });
        return;
      case 'move_and_interact':
        const selectedCharData = allyStates[selectedCharacter] || foeStates[selectedCharacter] || null;
        const draggedOverCharacter = clickedCharacter || null;
        const draggedOverCharacterData = allyStates[draggedOverCharacter] || foeStates[draggedOverCharacter] || null;

        if (!selectedCharData || !draggedOverCharacterData) {
          return;
        }

        const actionResult = characterInteraction(selectedCharData, draggedOverCharacterData);
        if (actionResult.error || !actionResult) {
          console.error(`Error: ${actionResult.error}`);
        } else {
          const interactionRange = actionResult.range ? actionResult.range : 0;
          const areaGrids = [...highlightedCells];
          const validMoveGrids = findNearestGrids(gridY, gridX, interactionRange, areaGrids);
          console.log(`validMoveGrids:`, validMoveGrids);
          setHighlightedCells(validMoveGrids);

          updateLogText(printInteractionResult(actionResult), 'interaction');
          updateTurnState({ characterName: selectedCharacter, justActed: true, justMoved: false });
        }
        resetSelectState({ resetClickedState: true, resetSelectedCharacter: true, resetHighlightedCells: true });
        return;
      case 'move':
        setSelectedCharacter(clickedCharacter);
        setCharacterPositions(prev => ({
          ...prev,
          [selectedCharacter]: { row: gridY, col: gridX }
        }));
        updateTurnState({ characterName: selectedCharacter, justActed: false, justMoved: true })
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

  return (
    <div className={styles['game-container']} onClick={handleContainerClick}>
      <div className={styles['content-wrapper']}>
        <CharacterStatUI
          charName={selectedCharState.name}
          level={selectedCharState.level}
          wpn={selectedCharState.wpn}
          hp={selectedCharState.hp}
          atk={selectedCharState.atk}
          spd={selectedCharState.spd}
          def={selectedCharState.def}
          res={selectedCharState.res}
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
              <DraggableCharacter
                key={charName}
                charName={charName}
                coordinates={{
                  x: gridAnchor.x - 0,
                  y: gridAnchor.y + 64
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
              />
            ) : null;
          })}
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
          mapClickMode={mapClickMode}
        />
      </div>
    </div>
  );
};

export default GameUI;

