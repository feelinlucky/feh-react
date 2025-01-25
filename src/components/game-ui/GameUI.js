import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './GameUI.module.css';
import { useLocation } from 'react-router-dom';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import CharacterStatUI from '../character-stat-ui/CharacterStatUI';
import Sprite from '../sprite/Sprite';
import { createTurnState } from './TurnState';
import GameMap, {
  visualizeTerrainGrid,
  defineTerrainGrid,
  TerrainType,
  calculateMovementRange
} from '../game-map/GameMap';

import { sharedProps, characterData } from '../character-data/CharacterData';
import { characterInteraction } from '../character-data/CharacterInteraction';
import MapCharacter from '../map-character/MapCharacter';
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
            const charState = characterData(charName);
            const gridPos = charPositions[charName];
            const movementRange = calculateMovementRange(
              gridPos.row,
              gridPos.col,
              sharedProps.moveTypes[charState.type].distance,
              charState.type,
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

  const [charState, setCharacterUIState] = useState({});
  const [clickedState, setClickedState] = useState(null);
  const [clickedStateHistory, setClickedStateHistory] = useState([]);
  const [gridAnchorCoordinates, setgridAnchorCoordinates] = useState({});
  const [selectedCharacter, setSelectedCharacter] = useState("Alfonse");
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
      acc[name] = { ...characterData(name), group: 'ally', hasActed: false };
      return acc;
    }, {})
  );

  const [foeStates, setFoeStates] = useState(
    foeNames.reduce((acc, name) => {
      acc[name] = { ...characterData(name), group: 'foe', hasActed: false };
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

  function TurnIndicator({ turnState }) {
    return (
      <div className="turn-indicator">
        <div>Turn: {turnState.getTurnNumber()}</div>
        <div>Active Group: {turnState.currentActiveGroupIsAlly() ? 'Allies' : 'Enemies'}</div>
        <div>Actions Remaining: {
          Object.values(turnState.currentGroupStates())
            .filter(unit => !unit.hasActed).length
        }</div>
      </div>
    );
  }

  // Track whether the current group is draggable
  const [isDraggable, setIsDraggable] = useState(true);

  // turn state hooks
  const handleTurnStart = (turnNumber) => {
    updateLogText(`Turn ${turnNumber} started`, 'event');
  };

  const handleTurnEnd = (turnNumber) => {
    updateLogText(`Turn ${turnNumber} ended`, 'event');
  };

  const handleGroupSwitch = (isAllyTurn) => {
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

      const selectedCharProps = sharedProps[selectedCharData.type];
    } else {
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
  }, [selectedCharacter, allyStates, foeStates, setCharacterUIState]);
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

  const handleContainerClick = useCallback((event) => {
    if (event.target.closest(`.${styles['map-container']}`)) {
      return;
    }

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
  const isCellHighlighted = useCallback((row, col) => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  }, [highlightedCells]);

  const isOccupiedCell = useCallback((row, col) => {
    return Object.values(charPositions).some(pos => pos.row === row && pos.col === col);
  }, [charPositions]);

  // Update turn state after each character action
  const updateTurnState = useCallback((characterName) => {
    turnState.hasActed(characterName);
  }, [turnState, updateLogText]);

  const handleGridClick = useCallback((gridY, gridX) => {
    const newState = { gridY, gridX, isMapGrid: true };

    if (isCellHighlighted(gridY, gridX) && selectedCharacter && turnState.waitingToAct(selectedCharacter)) {
      if (isOccupiedCell(gridY, gridX)) {
        const selectedCharData = allyStates[selectedCharacter] || foeStates[selectedCharacter];
        const draggedOverCharacter = findCharacterNameByGridPosition({ row: gridY, col: gridX }, charPositions) || null;
        const draggedOverCharacterData = allyStates[draggedOverCharacter] || foeStates[draggedOverCharacter] || null;

        if (draggedOverCharacterData.group === 'ally') {
          const charAssist = selectedCharData.skills.assist || null;

          updateLogText(`${selectedCharacter} used assist skill ${charAssist} to ${draggedOverCharacter}`, 'interaction');
        } else {
          const charWeapon = selectedCharData.skills.weapon || null;

          updateLogText(`${selectedCharacter} attacked ${draggedOverCharacter} with ${charWeapon}`, 'interaction');
        }
      } else {
        setCharacterPositions(prev => ({
          ...prev,
          [selectedCharacter]: { row: gridY, col: gridX }
        }));
      }
      updateTurnState(selectedCharacter);
      updateLogText(`${selectedCharacter} has acted. Now turn # ${turnState.getTurnNumber()}. Current active group is ${turnState.currentActiveGroupIsAlly() ? 'ally' : 'foes'}`, 'event');

      setHighlightedCells([]);
      setSelectedCharacter(null);
      setClickedState(null);
      return;
    }

    const characterAtPosition = Object.entries(charPositions).find(
      ([_, pos]) => pos.row === gridY && pos.col === gridX
    );

    if (characterAtPosition) {
      const [charName, _] = characterAtPosition;
      const charState = allyStates[charName] || foeStates[charName];
      newState.characterName = charName;
      setSelectedCharacter(charName);

      const movementRange = calculateMovementRange(
        gridY,
        gridX,
        sharedProps.moveTypes[charState.type].distance,
        charState.type,
        terrainData
      );
      setHighlightedCells(movementRange);
    } else if (!isCellHighlighted(gridY, gridX)) {
      setHighlightedCells([]);
      setSelectedCharacter(null);
    }

    setClickedState(newState);
    setClickedStateHistory(prev => {
      const newHistory = [newState, ...prev].slice(0, 5);
      return newHistory;
    });
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
          charName={charState.charName || ''}
          level={charState.level || 0}
          wpn={charState.wpn || ''}
          hp={charState.hp || 0}
          atk={charState.atk || 0}
          spd={charState.spd || 0}
          def={charState.def || 0}
          res={charState.res || 0}
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
        <div className={styles['debug-display']}>
          <button
            onClick={toggleDebugDisplay}
            className={styles['debug-button']}
          >
            {isDebugDisplayVisible ? 'Collapse Debug Info' : 'Expand Debug Info'}
          </button>
          {isDebugDisplayVisible && (
            <div>
              {draggedOverCell ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      onClick={toggleCursorObserver}
                      className={`${styles['debug-button']} ${isCursorObserverActive ? styles['active'] : ''}`}
                    >
                      Cursor Observer: {isCursorObserverActive ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => setShowTerrainOverlay(!showTerrainOverlay)}
                      className={`${styles['debug-button']} ${showTerrainOverlay ? styles['active'] : ''}`}
                    >
                      Terrain Overlay: {showTerrainOverlay ? 'ON' : 'OFF'}
                    </button>
                    <pre>
                      Drag Debug Info:
                      {JSON.stringify({
                        cursorObserver: {
                          active: isCursorObserverActive,
                          position: currentCursorPos || 'none'
                        },
                        draggedOverCell: draggedOverCell || 'none',
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
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      onClick={toggleCursorObserver}
                      className={`${styles['debug-button']} ${isCursorObserverActive ? styles['active'] : ''}`}
                    >
                      Cursor Observer: {isCursorObserverActive ? 'ON' : 'OFF'}
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
            </div>
          )}
        </div>
        <div className={styles['log-text-container']}>
          <div className={styles['log-text-header']}>
            Log
            <button
              onClick={() => setErrorLogging(!errorLogging)}
              className={styles['debug-button']}
            >
              {errorLogging ? 'Disable Error Logging' : 'Enable Error Logging'}
            </button>
          </div>
          <div className={styles['log-text-tabs']}>
            <button
              className={activeTab === "categorized" ? styles['active-tab'] : ""}
              onClick={() => setActiveTab("categorized")}
            >
              Categorized
            </button>
            <button
              className={activeTab === "uncategorized" ? styles['active-tab'] : ""}
              onClick={() => setActiveTab("uncategorized")}
            >
              Uncategorized
            </button>
          </div>
          <div className={styles['log-text-content']}>
            {activeTab === "categorized" ? (
              categorizedLogs.map((log, index) => (
                <div key={index} className={styles['log-text-item']}>
                  {log.text}
                </div>
              ))
            ) : (
              uncategorizedLogs.map((log, index) => (
                <div key={index} className={styles['log-text-item']}>
                  {log.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;

