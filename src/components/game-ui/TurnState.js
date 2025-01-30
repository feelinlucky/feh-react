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

  function nextGroupStates() {
    return currentTurnIsOdd() ? foeStates : allyStates;
  }

  function currentActiveGroupIsAlly() {
    return currentTurnIsOdd() ? true : false;
  }

  function getTurnNumber() {
    return turnNumber;
  }

  function currentGroupHasEndedTurn() {
    const currentGroup = currentGroupStates();
    return Object.values(currentGroup).every(unit => unit.endedTurn);
  };

  function advanceTurn() {
    if (onTurnEnd) onTurnEnd(turnNumber);
    turnNumber++;
    resetGroupActions();
    if (onGroupSwitch) onGroupSwitch();
    if (onTurnStart) onTurnStart(turnNumber);
  }

  function getCharacterTurnState(characterName) {
    const currentGroup = currentGroupStates();
    return currentGroup[characterName] || null; // Returns the character's state or null if not found
  }

  // Check if the character is in the current group and hasn't acted yet
  function unitTurnFinished(characterName) {
    if (currentGroupHasEndedTurn()) {
      advanceTurn();
      return true; // Indicates turn has ended
    }

    const charTurnState = getCharacterTurnState(characterName);

    if (charTurnState.hasMoved && charTurnState.hasActed) {
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

  function hasMoved(characterName) {
    if (setUnitState(characterName, 'hasMoved', true)) {
      return unitTurnFinished(characterName);
    }
    return false;
  }

  function hasActed(characterName) {
    if (setUnitState(characterName, 'hasActed', true)) {
      return unitTurnFinished(characterName);
    }
    return false;
  }

  function setUnitTurnAsFinished(characterName) {
    return (hasMoved(characterName) && hasActed(characterName))
  }

  function endTurnCurrentGroup() {
    const currentGroup = currentGroupStates();
    Object.values(currentGroup).forEach(unit => (
      unit.hasActed = false,
      unit.hasMoved = false,
      unit.endedTurn = false
    ));
  }

  function startTurnNextGroup() {
    const nextGroup = nextGroupStates();
    Object.values(nextGroup).forEach(unit => (
      unit.hasActed = true,
      unit.hasMoved = true,
      unit.endedTurn = true
    ));
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
    getCharacterTurnState,
    unitTurnFinished,
    hasMoved,
    hasActed,
    setUnitTurnAsFinished,
    resetGroupActions,
    currentGroupHasEndedTurn,
    advanceTurn,
    undo,
    redo
  };
}

export { createTurnState };