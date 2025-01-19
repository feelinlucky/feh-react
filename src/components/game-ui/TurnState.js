/* #region Find current turn based which group still has units that can act */
// determine turn based on turn number, and which group still has units that can actfunction
function createTurnState(allyStates, foeStates, turnNumber = 1) {
  // ally units always act first, then foe units
  function currentTurnIsOdd(turnNumber) {
    if ((turnNumber === 1) || ((turnNumber % 2) === 0)) {
      return true;
    }
    return false;
  };

  function currentGroupStates() {
    if (currentTurnIsOdd(turnNumber)) {
      return allyStates;
    }
    return foeStates;
  };

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
    }
  };

  return {
    getTurnNumber,
    nextTurn,
  };
}

export { createTurnState };