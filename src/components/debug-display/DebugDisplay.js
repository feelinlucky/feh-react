import React from 'react';
import PropTypes from 'prop-types';
import styles from './DebugDisplay.module.css';

const DebugButton = ({ label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`${styles.debugButton} ${isActive ? styles.active : ''}`}
    aria-pressed={isActive}
  >
    {label}
  </button>
);

DebugButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
};

DebugButton.defaultProps = {
  isActive: false,
};

const DebugInfoBlock = ({ title, data, children }) => {
  // Convert data to an array of rows for the table
  const dataRows = Object.entries(data).map(([key, value]) => {
    return (
      <tr key={key}>
        <td>{key}</td>
        <td>{JSON.stringify(value)}</td>
      </tr>
    );
  });

  return (
    <div className={styles.debugInfoBlock}>
      <h4 className={styles.debugInfoTitle}>{title}</h4>
      <table className={styles.debugInfoTable}>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {dataRows}
        </tbody>
      </table>
      {children}
    </div>
  );
};

DebugInfoBlock.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.any.isRequired,
  children: PropTypes.node,
};

const TurnIndicator = ({ turnState }) => (
  <div className={styles.turnIndicator}>
    <div>Turn: {turnState.getTurnNumber()}</div>
    <div>Active Group: {turnState.currentActiveGroupIsAlly() ? 'Allies' : 'Enemies'}</div>
    <div>Actions Remaining: {
      Object.values(turnState.currentGroupStates())
        .filter(unit => !unit.hasActed).length
    }</div>
  </div>
);

TurnIndicator.propTypes = {
  turnState: PropTypes.object.isRequired,
};

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
  toggleDebugDisplay,
  turnState
}) => {
  const gridCellCoordinates =
    draggedOverCell && gridAnchorCoordinates
      ? calculateGridCellCoordinates(draggedOverCell, gridAnchorCoordinates)
      : null;

  return (
    <div className={styles.debugDisplay}>
      <button
        onClick={toggleDebugDisplay}
        className={styles.debugToggleButton}
        aria-expanded={isDebugDisplayVisible}
      >
        {isDebugDisplayVisible ? 'Collapse Debug Info' : 'Expand Debug Info'}
      </button>

      {isDebugDisplayVisible && (
        <div className={styles.debugContent}>
          <div className={styles.debugButtonGroup}>
            <DebugButton
              label={`Cursor Observer: ${isCursorObserverActive ? 'ON' : 'OFF'}`}
              onClick={toggleCursorObserver}
              isActive={isCursorObserverActive}
            />
            <DebugButton
              label={`Terrain Overlay: ${showTerrainOverlay ? 'ON' : 'OFF'}`}
              onClick={() => setShowTerrainOverlay(!showTerrainOverlay)}
              isActive={showTerrainOverlay}
            />
          </div>

          <DebugInfoBlock
            title="Drag Debug Info"
            data={{
              cursorObserver: {
                active: isCursorObserverActive,
                position: currentCursorPos || 'none',
              },
              draggedOverCell: draggedOverCell || 'none',
              inputVariables: {
                draggedOverGrid: draggedOverCell,
                cursorPos: currentCursorPos
                  ? {
                    original: currentCursorPos,
                    adjusted: {
                      x: currentCursorPos.x - mapPosition.x,
                      y: currentCursorPos.y - mapPosition.y,
                    },
                    adjustedToGrid:
                      draggedOverCell && gridAnchorCoordinates
                        ? {
                          x:
                            currentCursorPos.x -
                            mapPosition.x -
                            gridAnchorCoordinates[
                              `${draggedOverCell.row}-${draggedOverCell.col}`
                            ].x,
                          y:
                            currentCursorPos.y -
                            mapPosition.y -
                            gridAnchorCoordinates[
                              `${draggedOverCell.row}-${draggedOverCell.col}`
                            ].y,
                        }
                        : 'none',
                  }
                  : 'none',
                mapPosition: mapPosition,
              },
            }}
          />

          {gridCellCoordinates && (
            <DebugInfoBlock
              title="Grid Cell Coordinates"
              data={gridCellCoordinates}
            />
          )}

          <DebugInfoBlock
            title="Clicked State"
            data={{
              clickedPosition: clickedState
                ? `[${clickedState.gridY}, ${clickedState.gridX}]`
                : 'None',
              selectedCharacter: selectedCharacter || 'None',
              clickedCharacter: clickedState?.characterName || 'None',
              isMapGrid: clickedState?.isMapGrid ? 'Yes' : 'No',
              history: clickedStateHistory,
            }}
          />

          <DebugInfoBlock
            title="Turn Indicator"
            data={{
              Turn: `${turnState.getTurnNumber()}`,
              ActiveGroup: `${turnState.currentActiveGroupIsAlly() ? 'Allies' : 'Enemies'}`,
              ActionsRemaining: `${
                Object.values(turnState.currentGroupStates())
                  .filter(unit => !unit.hasActed).length
              }`
            }}
          />

        </div >
      )}
    </div >
  );
};

DebugDisplay.propTypes = {
  draggedOverCell: PropTypes.object,
  toggleCursorObserver: PropTypes.func.isRequired,
  isCursorObserverActive: PropTypes.bool.isRequired,
  currentCursorPos: PropTypes.object,
  mapPosition: PropTypes.object.isRequired,
  gridAnchorCoordinates: PropTypes.object.isRequired,
  calculateGridCellCoordinates: PropTypes.func.isRequired,
  clickedState: PropTypes.object,
  selectedCharacter: PropTypes.string,
  clickedStateHistory: PropTypes.array.isRequired,
  showTerrainOverlay: PropTypes.bool.isRequired,
  setShowTerrainOverlay: PropTypes.func.isRequired,
  isDebugDisplayVisible: PropTypes.bool.isRequired,
  toggleDebugDisplay: PropTypes.func.isRequired,
  turnState: PropTypes.object.isRequired,
};

export default DebugDisplay;