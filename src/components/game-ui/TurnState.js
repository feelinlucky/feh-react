function createTurnState(playerUnits, cpuUnits) {
  let currentTurn = "player"; // Start with the player's turn
  let turnNumber = 1;

  function getCurrentTurn() {
    return currentTurn;
  }

  function getTurnNumber() {
    return turnNumber;
  }

  function nextTurn() {
    if (currentTurn === "player") {
      currentTurn = "cpu";
      // CPU logic here (e.g., AI movement and actions)
      playerUnits.forEach(unit => unit.hasActed = true);
      cpuUnits.forEach(unit => unit.hasActed = false);
      cpuTurn();
    } else {
      currentTurn = "player";
      cpuUnits.forEach(unit => unit.hasActed = true);
      playerUnits.forEach(unit => unit.hasActed = false);
      turnNumber++; // Increment turn number only after player's turn
    }
     // Reset action availability for all units at the start of a new turn
  }

  function cpuTurn() {
    // Example CPU behavior (replace with your actual AI logic)
    for (const cpuUnit of cpuUnits) {
      if (!cpuUnit.hasActed) { // Check if the unit has already acted in this turn
        // Perform CPU actions (e.g., movement, attack)
        // ... your CPU AI logic here ...

        cpuUnit.hasActed = true; // Mark the unit as having acted
      }
    }

    // After all CPU units have acted (or chosen not to), end the CPU turn
    nextTurn(); // Automatically switch back to player's turn
  }  

  return {
    getCurrentTurn,
    getTurnNumber,
    nextTurn
  };
}

export { createTurnState };