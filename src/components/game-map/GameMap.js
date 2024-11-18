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