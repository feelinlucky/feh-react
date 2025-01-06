// Define gridSize if not already defined
const gridSize = 64; // Assuming each grid cell is 64x64 pixels

// Define TerrainCost if not already defined
const TerrainCost = {
  plain: 1,
  forest: 2,
  mountain: 3,
  water: 4,
  wall: Infinity
};

export const findNearestGridEdgeToCursor = (draggedOverGrid, cursorPos, gridAnchorCoordinates, gameUIPosition = { x: 0, y: 0 }) => {
  // Adjust cursor position relative to GameUI component's position
  const adjustedCursorPosToMap = {
    x: cursorPos.x - gameUIPosition.x,
    y: cursorPos.y - gameUIPosition.y
  };

  // Get the center coordinates of the current grid cell
  const currentGridAnchor = gridAnchorCoordinates[`${draggedOverGrid.row}-${draggedOverGrid.col}`];

  if (!currentGridAnchor) {
    return null;
  }

  const adjustedCursorPosToGrid = {
    x: adjustedCursorPosToMap.x - currentGridAnchor.x,
    y: adjustedCursorPosToMap.y - currentGridAnchor.y
  };

  // Calculate distances from cursor to each edge of the grid cell
  const halfCell = gridSize / 2;

  // Compute distances for each edge
  const edgeDistances = {
    top: Math.abs(adjustedCursorPosToGrid.y + halfCell),
    bottom: Math.abs(adjustedCursorPosToGrid.y - halfCell),
    left: Math.abs(adjustedCursorPosToGrid.x + halfCell),
    right: Math.abs(adjustedCursorPosToGrid.x - halfCell)
  };

  // Sort edges by distance
  const sortedEdges = Object.entries(edgeDistances)
    .sort(([, distA], [, distB]) => distA - distB)
    .map(([edge]) => edge);
  // Return the two nearest edges
  return sortedEdges.slice(0, 2);
};

export const calculateGridDistance = (gridPos1, gridPos2) => {
    // Original implementation
};

export const calculateCharDistance = (positions, charName1, charName2) => {
    const char1Pos = positions[charName1];
    const char2Pos = positions[charName2];
    return calculateGridDistance(char1Pos, char2Pos);
};

/**
 * Calculates cells within movement range considering terrain costs
 * @param {number} centerRow - Starting row coordinate
 * @param {number} centerCol - Starting column coordinate
 * @param {number} movementPoints - Total movement points available
 * @param {string} moveType - Type of movement (infantry, cavalry, etc.)
 * @param {Array<Array<string>>} terrainGrid - Grid of terrain types
 * @returns {Array<{row: number, col: number}>} Array of reachable cells
 */
export const calculateMovementRange = (centerRow, centerCol, movementPoints, moveType, terrainGrid) => {
    const reachableCells = new Set();
    const visited = new Set();
    const queue = [{
      row: centerRow,
      col: centerCol,
      remainingPoints: movementPoints
    }];
  
    // Helper to create a unique key for a cell
    const cellKey = (row, col) => `${row},${col}`;
  
    while (queue.length > 0) {
      const { row, col, remainingPoints } = queue.shift();
      const key = cellKey(row, col);
  
      // Skip if we've been here with more movement points
      if (visited.has(key)) continue;
      visited.add(key);
  
      // Add current cell to reachable cells
      reachableCells.add(key);
  
      // Check adjacent cells (orthogonal movement)
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
  
        // Check bounds
        if (newRow < 0 || newRow >= gridSize.rows || 
            newCol < 0 || newCol >= gridSize.cols) {
          continue;
        }
  
        // Get terrain cost
        const terrainType = terrainGrid[newRow][newCol];
        const moveCost = TerrainCost[terrainType][moveType] || 999;
  
        // Skip impassable terrain or if not enough movement points
        if (moveCost === 999 || moveCost > remainingPoints) {
          continue;
        }
  
        // Add to queue if we have enough movement points
        const newRemainingPoints = remainingPoints - moveCost;
        if (newRemainingPoints >= 0) {
          queue.push({
            row: newRow,
            col: newCol,
            remainingPoints: newRemainingPoints
          });
        }
      }
    }
  
    // Convert Set of keys back to array of coordinates
    return Array.from(reachableCells).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });
  };