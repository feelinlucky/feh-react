import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './GameMap.module.css';
import { useLocation } from 'react-router-dom';
import Sprite from '../sprite/Sprite';
import MockChild from '../mock-child/MockChild';

const publicFolder = `${process.env.PUBLIC_URL}`;

// TODO: Implement other maps.

const GameMap = ({ onGridClick, ongridAnchorCoordinates, clickedState }) => {
    const mapImage = `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;
    const imgRef = useRef(null);
    const mapImageWidthRef = useRef(0);
    const gridSize = { rows: 6, cols: 8 };
    const [gridAnchorCoordinates, setgridAnchorCoordinates] = useState([]);
    useEffect(() => {
        if (imgRef.current) {
            mapImageWidthRef.current = imgRef.current.offsetWidth;
        }
    }, []);

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
                const isHighlighted = clickedState && clickedState.gridY === row && clickedState.gridX === col;
                grid.push(
                    <div
                        key={`${row}-${col}`}
                        className={`${styles['grid-cell']} ${isHighlighted ? styles['grid-cell-highlighted'] : ''}`}
                        onClick={() => handleGridClick(row, col)}
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
    })
};

export default GameMap;