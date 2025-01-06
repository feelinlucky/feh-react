import React from 'react';
import styles from './DebugDisplay.module.css';

const DebugDisplay = ({ debugState, setDebugState }) => {
  const { isDebugVisible, isCursorObserverActive, cursorPosition } = debugState;

  const toggleDebugVisibility = () =>
    setDebugState((prev) => ({ ...prev, isDebugVisible: !prev.isDebugVisible }));
  const toggleCursorObserver = () =>
    setDebugState((prev) => ({ ...prev, isCursorObserverActive: !prev.isCursorObserverActive }));

  return (
    <div className={styles['debug-display']}>
      <button onClick={toggleDebugVisibility}>
        {isDebugVisible ? 'Hide Debug Info' : 'Show Debug Info'}
      </button>
      {isDebugVisible && (
        <div>
          <button onClick={toggleCursorObserver}>
            Cursor Observer: {isCursorObserverActive ? 'ON' : 'OFF'}
          </button>
          <pre>{JSON.stringify({ cursorPosition }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugDisplay;