import React, { useState, useEffect, useRef, useCallback } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useLocation } from 'react-router-dom';
import { sharedProps, characterData } from '../character-data/CharacterData';
import {
  findNearestGridEdgeToCursor,
  calculateGridDistance,
  calculateCharDistance,
  calculateMovementRange,
} from './helpers';
import MapCharacter from '../map-character/MapCharacter'; // Corrected import path
import styles from './DraggableCharacter.module.css';

const DraggableCharacter = ({
  charName,
  coordinates,
  isSelected,
  setParentIsDragging,
  setSelectedCharacter,
  setHighlightedCells,
  setIsNearestEdgeDisplayActive,
  setNearestGridEdges,
  characterPositions,
  gridAnchorCoordinates,
  mapPosition,
  terrainData,
  setIsDropTriggered,
  updateLogText // Add updateLogText handler
}) => {
  const overlayRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

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

          // Ensure the character is selected and movement range is generated
          if (!isSelected) {
            setSelectedCharacter(charName);
            const char = characterData(charName);
            const gridPos = characterPositions[charName];
            const movementRange = calculateMovementRange(
              gridPos.row,
              gridPos.col,
              sharedProps.moveTypes[char.type].distance,
              char.type,
              terrainData
            );
            setHighlightedCells(movementRange);
          }

          // Automatically toggle nearest edge display to true
          setIsNearestEdgeDisplayActive(true);
        },
        onDrag: (event) => {
          if (isDragging) {
            // Continuously update nearest edge display
            const cursorPos = { x: event.clientX, y: event.clientY };
            const gridPos = characterPositions[charName];
            const nearestEdges = findNearestGridEdgeToCursor(
              gridPos,
              cursorPos,
              gridAnchorCoordinates,
              mapPosition
            );
            setNearestGridEdges(nearestEdges);
          }
        },
        onDrop: () => {
          setIsDragging(false);
          setParentIsDragging(false);
          setIsDropTriggered(true); // Set drop trigger state to true
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
    setIsNearestEdgeDisplayActive,
    setNearestGridEdges,
    characterPositions,
    gridAnchorCoordinates,
    mapPosition,
    terrainData,
    setIsDropTriggered,
    updateLogText // Add updateLogText handler
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

export default DraggableCharacter;
