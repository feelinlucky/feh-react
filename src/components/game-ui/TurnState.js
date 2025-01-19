/* #region Find current turn based which group still has units that can act */
// determine turn based on turn number, and which group still has units that can act
function createTurnState(allyStates, foeStates) {
  let turnNumber = 1; // Persistent internal variable

  // ally units always act first, then foe units
  function currentTurnIsOdd() {
    if ((turnNumber === 1) || ((turnNumber % 2) === 1)) {
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

  // after each unit has acted, automatically check if all units have acted, return true if all units have acted
  function hasActed(characterName) {
    const currentGroup = currentGroupStates();
    const currentUnit = currentGroup[characterName];
    currentUnit.hasActed = true;
    if (currentGroupHasActed()) {
      turnNumber++;
      return true;
    }
    return false;
  }

  return {
    currentActiveGroupName,
    currentGroupStates,
    getTurnNumber,
    hasActed
  };
}

export { createTurnState };