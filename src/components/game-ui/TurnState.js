function createTurnState(allyStates, foeStates, {
  onTurnStart,
  onTurnEnd,
  onGroupSwitch,
  setAllyStates,
  setFoeStates
}) {
  let turnNumber = 1;

  function getCharacterState(characterName) {
    const characterState = allyStates[characterName] || foeStates[characterName] || null;
    return characterState;
  }

  function currentTurnIsOdd() {
    return (turnNumber === 1) || ((turnNumber % 2) === 1);
  }

  function currentGroupStates() {
    return currentTurnIsOdd() ? allyStates : foeStates;
  }

  function nextGroupStates() {
    return currentTurnIsOdd() ? foeStates : allyStates;
  }

  function currentActiveGroupIsAlly() {
    return currentTurnIsOdd() ? true : false;
  }

  function getTurnNumber() {
    return turnNumber;
  }

  function currentGroupHasFinishedTurn() {
    const currentGroup = currentGroupStates();
    return Object.values(currentGroup).every(unit => unit.endedTurn);
  };

  function advanceTurn() {
    if (onTurnEnd) onTurnEnd(turnNumber);
    turnNumber++;
    resetGroupActions();
    if (onGroupSwitch) onGroupSwitch(turnNumber);
    if (onTurnStart) onTurnStart(turnNumber);
  }

  function getCharacterTurnState(characterName) {
    const currentGroup = currentGroupStates();
    return currentGroup[characterName] || null; // Returns the character's state or null if not found
  }

  // Check if the character is in the current group and hasn't acted yet
  function unitTurnFinished(characterName) {
    const charTurnState = getCharacterTurnState(characterName);
    if ((charTurnState?.isAlly === currentActiveGroupIsAlly())
      && (charTurnState.hasActed && charTurnState.hasMoved)) {
      charTurnState.endedTurn = true;
      return true;
    }
    return false;
  }

  function setUnitState(characterName, propName, bool) {
    const currentGroup = currentGroupStates();
    const currentUnit = currentGroup[characterName];

    if (!currentUnit) {
      console.error(`Character ${characterName} not found in current group ${currentActiveGroupIsAlly()}.`);
      return false;
    }

    currentUnit[propName] = bool; // currentUnit is a reference to an object within allyStates or foeStates

    return (currentUnit[propName] === bool);
  }

  function updateGroupTurnState(characterName) {
    if (unitTurnFinished(characterName) && currentGroupHasFinishedTurn()) {
      advanceTurn();
      return true;
    };
    return false;
  }

  function hasMoved(characterName) {
    if (setUnitState(characterName, 'hasMoved', true)) {
      return updateGroupTurnState(characterName)
    }
    return false;
  }

  function hasActed(characterName) {
    if (setUnitState(characterName, 'hasActed', true)) {
      return updateGroupTurnState(characterName)
    };
    return false;
  }

  function setUnitTurnAsFinished(characterName) {
    return (hasMoved(characterName) && hasActed(characterName))
  }

  function getAliveState(characterName) {
    const charState = getCharacterState(characterName);
    if (!charState) {
      console.error(`Character ${characterName} not found.`);
      return null;
    }
    return charState.isAlive;
  }

  function setAliveState(characterName, bool) {
    const charState = getCharacterState(characterName);
    if (!charState) {
      console.error(`Character ${characterName} not found.`);
      return false;
    }
    charState.isAlive = bool;

    if (getAliveState(characterName) === false) {
      setUnitTurnAsFinished(characterName);
    };
    return;
  }

  function applyAliveState(characterName) {
    const charState = getCharacterState(characterName);
    if (!charState) {
      console.error(`Character ${characterName} not found.`);
      return false;
    }
    if (charState.isAlive && (charState.hp <= 0)) {
      setAliveState(characterName, false);
    };

    return;
  }

  function applyAliveStates(characterNames) {
    for (const characterName of characterNames) {
      applyAliveState(characterName);
    };
    return;
  }

  function endTurnCurrentGroup() {
    const currentGroup = currentGroupStates();
    const updatedGroup = { ...currentGroup };
    Object.keys(updatedGroup).forEach(characterName => {
      updatedGroup[characterName] = {
        ...updatedGroup[characterName],
        hasActed: false,
        hasMoved: false,
        endedTurn: false
      };
    });
    if (currentActiveGroupIsAlly()) {
      setAllyStates(updatedGroup);
    } else {
      setFoeStates(updatedGroup);
    }
  }

  function startTurnNextGroup() {
    const nextGroup = nextGroupStates();
    const updatedGroup = { ...nextGroup };
    Object.keys(updatedGroup).forEach(characterName => {
      if (updatedGroup[characterName].isAlive) {
        updatedGroup[characterName] = {
          ...updatedGroup[characterName],
          hasActed: false,
          hasMoved: false,
          endedTurn: false
        };
      } else {
        console.log(updatedGroup[characterName].name + ' is dead.');
      }
    });
    if (!currentActiveGroupIsAlly()) {
      setAllyStates(updatedGroup);
    } else {
      setFoeStates(updatedGroup);
    }
  }
  
  function resetGroupActions() {
    endTurnCurrentGroup();
    startTurnNextGroup();
  }
  // Undo/redo moves
  const turnHistory = [];
  const redoStack = [];

  const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };

  function saveTurnState() {
    turnHistory.push({
      turnNumber,
      allyStates: deepClone(allyStates),
      foeStates: deepClone(foeStates)
    });
  }

  function undo() {
    if (turnHistory.length > 1) {
      redoStack.push(turnHistory.pop());
      const prevState = turnHistory[turnHistory.length - 1];
      turnNumber = prevState.turnNumber;
      setAllyStates(prevState.allyStates);
      setFoeStates(prevState.foeStates);
    }
  }

  function redo() {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      turnHistory.push(nextState);
      turnNumber = nextState.turnNumber;
      setAllyStates(nextState.allyStates);
      setFoeStates(nextState.foeStates);
    }
  }
  return {
    currentActiveGroupIsAlly,
    currentGroupStates,
    getTurnNumber,
    getCharacterTurnState,
    unitTurnFinished,
    hasMoved,
    hasActed,
    applyAliveState,
    applyAliveStates,
    setUnitTurnAsFinished,
    resetGroupActions,
    currentGroupHasFinishedTurn,
    advanceTurn,
    undo,
    redo
  };
}

export { createTurnState };