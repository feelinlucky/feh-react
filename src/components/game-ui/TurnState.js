function createTurnState(allyStates, foeStates) {
  let turnNumber = 1;

  function currentTurnIsOdd() {
    return (turnNumber === 1) || ((turnNumber % 2) === 1);
  }

  function currentGroupStates() {
    return currentTurnIsOdd() ? allyStates : foeStates;
  }

  function currentActiveGroupName() {
    return currentTurnIsOdd() ? 'ally' : 'foe';
  }

  function getTurnNumber() {
    return turnNumber;
  }

  function currentGroupHasActed() {
    const currentGroup = currentGroupStates();
    return Object.values(currentGroup).every(unit => unit.hasActed);
  }

  function hasActed(characterName) {
    const currentGroup = currentGroupStates();
    const currentUnit = currentGroup[characterName]; 
    
    console.log('Character Name:', characterName);
    console.log('Current Group:', currentGroup);
    console.log('Current Unit:', currentUnit);
  
    if (!currentUnit) {
      console.error(`Character ${characterName} not found in current group.`);
      return false;
    }
    
    currentUnit.hasActed = true; // currentUnit is a reference to an object within allyStates or foeStates

    if (currentGroupHasActed()) {
      turnNumber++; // Increment turn
      return true; // Indicates turn has ended
    }
    return false;
  }

  function resetGroupActions() {
    const group = currentGroupStates();
    Object.values(group).forEach(unit => (unit.hasActed = false));
  }

  return {
    currentActiveGroupName,
    currentGroupStates,
    getTurnNumber,
    hasActed,
    resetGroupActions,
    currentGroupHasActed,
  };
}

export { createTurnState };