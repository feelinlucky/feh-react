import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './GameMap.module.css';
import { useLocation } from 'react-router-dom';
import Sprite from '../sprite/Sprite';
import MockChild from '../mock-child/MockChild';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

const publicFolder = `${process.env.PUBLIC_URL}`;

// TODO: Implement other maps.

export const gridSize = { rows: 6, cols: 8 };

// Utility function to calculate cells within a radius, excluding invalid terrain
/**
 * Utility function to calculate cells within a radius, excluding invalid terrain
 * @param {number} centerRow - Center row coordinate
 * @param {number} centerCol - Center column coordinate
 * @param {number} radius - Movement radius
 * @param {Array<{row: number, col: number}>} [invalidCells=[]] - Array of coordinates to exclude
 * @returns {Array<{row: number, col: number}>} Array of valid cell coordinates within radius
 */
export const calculateCellsInRadius = (centerRow, centerCol, radius, invalidCells = []) => {
    const cells = [];
    
    // Create a Set of invalid coordinates for O(1) lookup
    const invalidSet = new Set(
        invalidCells.map(cell => `${cell.row},${cell.col}`)
    );

    // Check each cell in a square area around the center
    for (let row = Math.max(0, centerRow - radius); row <= Math.min(gridSize.rows - 1, centerRow + radius); row++) {
        for (let col = Math.max(0, centerCol - radius); col <= Math.min(gridSize.cols - 1, centerCol + radius); col++) {
            // For orthogonal movement (like in Fire Emblem), use Manhattan distance
            const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
            
            // Check if the cell is within radius AND not in invalid cells
            if (distance <= radius && !invalidSet.has(`${row},${col}`)) {
                cells.push({ row, col });
            }
        }
    }
    
    return cells;
};

// Terrain types enum
export const TerrainType = {
    PLAIN: 'plain',
    FOREST: 'forest',
    MOUNTAIN: 'mountain',
    WATER: 'water',
    WALL: 'wall'
};

// Create a reverse mapping for string to TerrainType conversion
const stringToTerrainType = Object.entries(TerrainType).reduce((acc, [key, value]) => {
    acc[value] = value;  // Use the string value directly
    acc[key.toLowerCase()] = value;  // Allow lowercase enum key
    return acc;
}, {});

/**
 * Helper function to visualize terrain grid in ASCII format
 * @param {Array<Array<string>>} grid - 2D array of terrain types
 * @returns {string} ASCII representation of the grid
 * 
 * Legend:
 * P - Plain
 * F - Forest
 * M - Mountain
 * W - Water
 * X - Wall
 * 
 * Example output:
 * ┌─────────┐
 * │FFFPPPPP│
 * │FFFMMMMM│
 * │PPPWWWPP│
 * │PPPWWWPP│
 * │PPPMMMPP│
 * │PPPXXXPP│
 * └─────────┘
 */
export const visualizeTerrainGrid = (grid) => {
    if (!Array.isArray(grid) || !Array.isArray(grid[0])) {
        return 'Invalid grid format';
    }

    const terrainToChar = {
        [TerrainType.PLAIN]: 'P',
        [TerrainType.FOREST]: 'F',
        [TerrainType.MOUNTAIN]: 'M',
        [TerrainType.WATER]: 'W',
        [TerrainType.WALL]: 'X'
    };

    const rows = grid.length;
    const cols = grid[0].length;
    const horizontalBorder = '─'.repeat(cols);

    let output = `┌${horizontalBorder}┐\n`;

    for (let row = 0; row < rows; row++) {
        output += '│';
        for (let col = 0; col < cols; col++) {
            const terrain = grid[row][col];
            output += terrainToChar[terrain] || '?';
        }
        output += '│\n';
    }

    output += `└${horizontalBorder}┘`;
    return output;
};

/**
 * Utility function to define terrain in a more convenient way using rectangular coordinates
 * @param {Array<Array<number, number, number, number, string>>} rectangles - Array of [upperLeftX, upperLeftY, lowerRightX, lowerRightY, terrainType]
 * @returns {Array<Array<string>>} 2D array of terrain types compatible with GameMap's terrainData prop
 * 
 * Example usage:
 * const terrainData = defineTerrainGrid([
 *   [0, 0, 2, 2, 'forest'],      // Can use string 'forest'
 *   [3, 0, 5, 1, 'mountain'],    // Can use string 'mountain'
 *   [1, 3, 3, 4, TerrainType.WATER], // Can still use TerrainType enum
 *   [6, 4, 7, 5, 'wall'],       // Can use string 'wall'
 * ]);
 */
export const defineTerrainGrid = (rectangles) => {
    // Initialize grid with PLAIN terrain
    const grid = Array(gridSize.rows).fill(null)
        .map(() => Array(gridSize.cols).fill(TerrainType.PLAIN));

    // Process each rectangle
    rectangles.forEach(([x1, y1, x2, y2, terrainType]) => {
        // Validate coordinates
        if (x1 < 0 || x2 >= gridSize.cols || y1 < 0 || y2 >= gridSize.rows) {
            console.warn(`Invalid coordinates in rectangle [${x1},${y1},${x2},${y2}]. Skipping.`);
            return;
        }
        
        // Convert string to valid terrain type
        const normalizedTerrainType = typeof terrainType === 'string' 
            ? terrainType.toLowerCase() 
            : terrainType;
        
        const validTerrainType = stringToTerrainType[normalizedTerrainType];
        
        if (!validTerrainType) {
            console.warn(`Invalid terrain type: ${terrainType}. Using PLAIN instead.`);
            terrainType = TerrainType.PLAIN;
        } else {
            terrainType = validTerrainType;
        }
        
        // Fill the rectangle with the specified terrain
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                grid[y][x] = terrainType;
            }
        }
    });
    
    return grid;
};

// Movement costs for different terrain types based on movement type
export const TerrainCost = {
  [TerrainType.PLAIN]: {
    infantry: 1,
    cavalry: 1,
    armored: 1,
    flying: 1
  },
  [TerrainType.FOREST]: {
    infantry: 2,
    cavalry: 3,
    armored: 2,
    flying: 1
  },
  [TerrainType.MOUNTAIN]: {
    infantry: 2,
    cavalry: 999, // Impassable
    armored: 3,
    flying: 1
  },
  [TerrainType.WATER]: {
    infantry: 999, // Impassable
    cavalry: 999, // Impassable
    armored: 999, // Impassable
    flying: 1
  },
  [TerrainType.WALL]: {
    infantry: 999, // Impassable
    cavalry: 999, // Impassable
    armored: 999, // Impassable
    flying: 999  // Impassable
  }
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

const DroppableCell = ({ row, col, isClicked, isHighlighted, terrainType, onClick, onDragOver }) => {
    const ref = useRef(null);
    const [isDraggedOver, setIsDraggedOver] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (el) {
            return dropTargetForElements({
                element: el,
                onDragEnter: () => {
                    setIsDraggedOver(true);
                    onDragOver?.(row, col);
                },
                onDragLeave: () => {
                    setIsDraggedOver(false);
                },
                onDrop: () => {
                    setIsDraggedOver(false);
                    // Only trigger click for highlighted cells
                    if (isHighlighted) {
                        onClick();
                    }
                },
            });
        }
    }, [onClick, onDragOver, row, col, isHighlighted]);

    return (
        <div
            ref={ref}
            className={`${styles['grid-cell']} 
                ${styles[`terrain-${terrainType}`]}
                ${isClicked ? styles['grid-cell-clicked'] : ''} 
                ${isHighlighted ? styles['grid-cell-highlighted'] : ''}
                ${isDraggedOver ? styles['grid-cell-dragged-over'] : ''}`}
            onClick={onClick}
            data-terrain={terrainType}
        />
    );
};

/*
terrainData should be a 2D array matching the dimensions defined in the gridSize constant (6 rows × 8 columns), e.g.:

const terrainData = [
    // 8 columns per row
    [TerrainType.PLAIN,  TerrainType.PLAIN,   TerrainType.FOREST,  TerrainType.FOREST,  TerrainType.MOUNTAIN, TerrainType.MOUNTAIN, TerrainType.PLAIN,  TerrainType.PLAIN],  // Row 0
    [TerrainType.PLAIN,  TerrainType.FOREST,  TerrainType.FOREST,  TerrainType.MOUNTAIN, TerrainType.WATER,   TerrainType.MOUNTAIN, TerrainType.PLAIN,  TerrainType.PLAIN],  // Row 1
    [TerrainType.WATER,  TerrainType.WATER,   TerrainType.PLAIN,   TerrainType.PLAIN,    TerrainType.PLAIN,   TerrainType.WALL,    TerrainType.WALL,   TerrainType.PLAIN],  // Row 2
    [TerrainType.PLAIN,  TerrainType.WATER,   TerrainType.PLAIN,   TerrainType.FOREST,   TerrainType.PLAIN,   TerrainType.WALL,    TerrainType.PLAIN,  TerrainType.PLAIN],  // Row 3
    [TerrainType.PLAIN,  TerrainType.PLAIN,   TerrainType.MOUNTAIN, TerrainType.FOREST,  TerrainType.FOREST,  TerrainType.PLAIN,   TerrainType.PLAIN,  TerrainType.FOREST], // Row 4
    [TerrainType.PLAIN,  TerrainType.MOUNTAIN, TerrainType.MOUNTAIN, TerrainType.PLAIN,  TerrainType.PLAIN,   TerrainType.PLAIN,   TerrainType.FOREST, TerrainType.FOREST]  // Row 5
];
*/

const GameMap = ({ onGridClick, ongridAnchorCoordinates, clickedState, highlightedCells, terrainData, onCellDragOver }) => {
    const mapImage = `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;
    const imgRef = useRef(null);
    const mapImageWidthRef = useRef(0);
    const [gridAnchorCoordinates, setgridAnchorCoordinates] = useState([]);

    useEffect(() => {
        if (imgRef.current) {
            mapImageWidthRef.current = imgRef.current.offsetWidth;
        }
    }, []);

    // Debug log for highlightedCells
    useEffect(() => {
        if (highlightedCells) {
            console.log('Received highlightedCells:', highlightedCells);
        }
    }, [highlightedCells]);

    // Calculate center coordinates for each grid cell
    const calculategridAnchorCoordinates = () => {
        if (imgRef.current) {
            const cellWidth = mapImageWidthRef.current / gridSize.cols;
            const cellHeight = imgRef.current.offsetHeight / gridSize.rows;
            const coordinates = {};
            for (let row = 0; row < gridSize.rows; row++) {
                for (let col = 0; col < gridSize.cols; col++) {
                    const centerX = col * cellWidth + cellWidth / 2;
                    const bottomY = row * cellHeight + cellHeight;
                    coordinates[`${row}-${col}`] = { x: centerX, y: bottomY };
                }
            }
            setgridAnchorCoordinates(coordinates);
            if (typeof ongridAnchorCoordinates === 'function') {
                ongridAnchorCoordinates(coordinates);
            }
        }
    };

    useEffect(() => {
        calculategridAnchorCoordinates();
    }, [mapImageWidthRef.current]);

    const handleGridClick = (row, col) => {
        if (typeof onGridClick === 'function') {
            onGridClick(row, col);
        } else {
            console.error('onGridClick is not a function');
        }
    };

    const renderGrid = () => {
        const grid = [];

        for (let row = 0; row < gridSize.rows; row++) {
            for (let col = 0; col < gridSize.cols; col++) {
                const isClicked = clickedState && clickedState.gridY === row && clickedState.gridX === col;
                const isHighlighted = highlightedCells && highlightedCells.some(cell =>
                    cell.row === row && cell.col === col
                );
                const terrainType = terrainData?.[row]?.[col] || TerrainType.PLAIN;

                grid.push(
                    <DroppableCell
                        key={`${row}-${col}`}
                        row={row}
                        col={col}
                        isClicked={isClicked}
                        isHighlighted={isHighlighted}
                        terrainType={terrainType}
                        onClick={() => handleGridClick(row, col)}
                        onDragOver={onCellDragOver}
                    />
                );
            }
        }
        return grid;
    };

    return (
        <div className={styles['map-container']}>
            <img src={mapImage} alt="Game Map" className={styles['map-image']} ref={imgRef} />
            <div className={styles['grid-overlay']}>
                {renderGrid()}
            </div>
        </div>
    );
};

GameMap.propTypes = {
    onGridClick: PropTypes.func.isRequired,
    ongridAnchorCoordinates: PropTypes.func,
    clickedState: PropTypes.shape({
        gridX: PropTypes.number,
        gridY: PropTypes.number,
        isMapGrid: PropTypes.bool,
        characterName: PropTypes.string
    }),
    highlightedCells: PropTypes.arrayOf(PropTypes.shape({
        row: PropTypes.number,
        col: PropTypes.number
    })),
    terrainData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    onCellDragOver: PropTypes.func
};

// Make GameMap the default export
export default GameMap;