import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './GameMap.module.css';
import { useLocation } from 'react-router-dom';
import Sprite from '../sprite/Sprite';
import MockChild from '../mock-child/MockChild';

const publicFolder = `${process.env.PUBLIC_URL}`;

// TODO: Implement other maps.

const gridSize = { rows: 6, cols: 8 };

// Utility function to calculate cells within a radius
export const calculateCellsInRadius = (centerRow, centerCol, radius) => {
    const cells = [];

    // Check each cell in a square area around the center
    for (let row = Math.max(0, centerRow - radius); row <= Math.min(gridSize.rows - 1, centerRow + radius); row++) {
        for (let col = Math.max(0, centerCol - radius); col <= Math.min(gridSize.cols - 1, centerCol + radius); col++) {
            // For orthogonal movement (like in Fire Emblem), use Manhattan distance
            const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
            if (distance <= radius) {
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

const GameMap = ({ onGridClick, ongridAnchorCoordinates, clickedState, highlightedCells, terrainData }) => {
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

                if (isHighlighted) {
                    console.log(`Cell [${row},${col}] is highlighted`);
                }

                grid.push(
                    <div
                        key={`${row}-${col}`}
                        className={`${styles['grid-cell']} 
                            ${styles[`terrain-${terrainType}`]}
                            ${isClicked ? styles['grid-cell-clicked'] : ''} 
                            ${isHighlighted ? styles['grid-cell-highlighted'] : ''}`}
                        onClick={() => handleGridClick(row, col)}
                        data-terrain={terrainType}
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
        gridY: PropTypes.number,
        gridX: PropTypes.number,
        isMapGrid: PropTypes.bool,
        characterName: PropTypes.string
    }),
    highlightedCells: PropTypes.arrayOf(PropTypes.shape({
        row: PropTypes.number.isRequired,
        col: PropTypes.number.isRequired
    })),
    terrainData: PropTypes.arrayOf(
        PropTypes.arrayOf(
            PropTypes.oneOf(Object.values(TerrainType))
        )
    )
};

// Make GameMap the default export
export default GameMap;