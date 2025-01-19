/* #region Find current turn based which group still has units that can act */
// determine turn based on turn number, and which group still has units that can act
function createTurnState(allyStates, foeStates) {
  let turnNumber = 1; // Persistent internal variable

  // ally units always act first, then foe units
  function currentTurnIsOdd() {
    if ((turnNumber === 1) || ((turnNumber % 2) === 0)) {
      return true;
    }
    return false;
  };

  function currentGroupStates() {
    if (currentTurnIsOdd()) {
      return allyStates;
    }
    return foeStates;
  };

  function currentActiveGroupName() {
    if (currentTurnIsOdd()) {
      return 'ally';
    }
    return 'foe';
  }

  function getTurnNumber() {
    return turnNumber;
  };

  // verify if current group has acted.
  function currentGroupHasActed() {
    const currentGroup = currentGroupStates();
    const allActed = Object.values(currentGroup).every(unit => unit.hasActed);
    return allActed;
  };

  // next turn functions verify if all units from active group have acted before incrementing turn number
  function nextTurn() {
    if (currentGroupHasActed()) {
      turnNumber++;
      return true;
    }
    return false;
  };

  // after each unit has acted, automatically check if all units have acted
  function hasActed(characterName) {
    const currentGroup = currentGroupStates();
    const currentUnit = currentGroup[characterName];
    currentUnit.hasActed = true;
    return nextTurn();
  }

  return {
    currentActiveGroupName,
    currentGroupStates,
    getTurnNumber,
    hasActed
  };
}

export { createTurnState };