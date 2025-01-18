function createTurnManager(playerUnits, cpuUnits) {
  let currentTurn = "player"; // Start with the player's turn
  let turnNumber = 1;

  const allUnits = [...playerUnits, ...cpuUnits];

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
      cpuTurn();


    } else {
      currentTurn = "player";
      turnNumber++; // Increment turn number only after player's turn
    }
     // Reset action availability for all units at the start of a new turn
    allUnits.forEach(unit => unit.hasActed = false); 

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


  // Initialize hasActed property for all units
  allUnits.forEach(unit => unit.hasActed = false);


  return {
    getCurrentTurn,
    getTurnNumber,
    nextTurn
  };
}


// Example usage (assuming you have playerUnits and cpuUnits arrays):
const turnManager = createTurnManager(playerUnits, cpuUnits);

// Check whose turn it is:
console.log("Current turn:", turnManager.getCurrentTurn());

// Advance to the next turn:
turnManager.nextTurn();

console.log("Current turn:", turnManager.getCurrentTurn());


// ... (in your game loop or event handler) ...
if (turnManager.getCurrentTurn() === "player") {
  // Allow player to select and move units
} else {
  // CPU's turn (call turnManager.cpuTurn() or handle CPU actions)
}
