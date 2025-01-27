import React from 'react';
import styles from './DebugDisplay.module.css';

const DebugDisplay = ({
  draggedOverCell,
  toggleCursorObserver,
  isCursorObserverActive,
  currentCursorPos,
  mapPosition,
  gridAnchorCoordinates,
  calculateGridCellCoordinates,
  clickedState,
  selectedCharacter,
  clickedStateHistory,
  showTerrainOverlay,
  setShowTerrainOverlay,
  isDebugDisplayVisible,
  toggleDebugDisplay
}) => {
  return (
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
                {/* Toggle buttons */}
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
  );
};

export default DebugDisplay;