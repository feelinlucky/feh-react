function createTurnState(allyStates, foeStates, {
  onTurnStart,
  onTurnEnd,
  onGroupSwitch
}) {
  let turnNumber = 1;

  function currentTurnIsOdd() {
    return (turnNumber === 1) || ((turnNumber % 2) === 1);
  }

  function currentGroupStates() {
    return currentTurnIsOdd() ? allyStates : foeStates;
  }

  function currentActiveGroupIsAlly() {
    return currentTurnIsOdd() ? true : false;
  }

  function getTurnNumber() {
    return turnNumber;
  }

  function currentGroupHasActed() {
    const currentGroup = currentGroupStates();
    return Object.values(currentGroup).every(unit => unit.hasActed); // all units have acted
  };

  function advanceTurn() {
    if (onTurnEnd) onTurnEnd(turnNumber);
    turnNumber++;
    resetGroupActions();
    if (onGroupSwitch) onGroupSwitch(turnNumber);
    if (onTurnStart) onTurnStart(turnNumber);
  }

  // Check if the character is in the current group and hasn't acted yet
  function waitingToAct(characterName) {
    if (currentGroupHasActed()) {
      advanceTurn();
      return false; // Indicates turn has ended
    }
    
    const currentGroup = currentGroupStates();
    const currentUnit = currentGroup[characterName];
    if (!currentUnit) {
      return false;
    }
    return !currentUnit.hasActed;
  }

  function hasActed(characterName) {
    const currentGroup = currentGroupStates();
    const currentUnit = currentGroup[characterName]; 
    
    if (!currentUnit) {
      console.error(`Character ${characterName} not found in current group ${currentActiveGroupIsAlly()}.`);
      return false;
    }
    
    currentUnit.hasActed = true; // currentUnit is a reference to an object within allyStates or foeStates

    if (currentGroupHasActed()) {
      advanceTurn();
      return true; // Indicates turn has ended
    }
    return false;
  }

  function resetGroupActions() {
    const group = currentGroupStates();
    Object.values(group).forEach(unit => (unit.hasActed = false));
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
      allyStates = prevState.allyStates;
      foeStates = prevState.foeStates;
    }
  }
  
  function redo() {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      turnHistory.push(nextState);
      turnNumber = nextState.turnNumber;
      allyStates = nextState.allyStates;
      foeStates = nextState.foeStates;
    }
  }

  return {
    currentActiveGroupIsAlly,
    currentGroupStates,
    getTurnNumber,
    waitingToAct,
    hasActed,
    resetGroupActions,
    currentGroupHasActed,
    advanceTurn,
    undo,
    redo
  };
}

export { createTurnState };