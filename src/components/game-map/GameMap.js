import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './GameMap.module.css';
import { useLocation } from 'react-router-dom';
import Sprite from '../sprite/Sprite';
import MockChild from '../mock-child/MockChild';

const publicFolder = `${process.env.PUBLIC_URL}`;

// TODO: Implement other maps.

const GameMap = ({ onGridClick, onGridCenterCoordinates }) => {
    const mapImage = `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;
    const imgRef = useRef(null);
    const mapImageWidthRef = useRef(0);
    const gridSize = { rows: 6, cols: 8 };
    const [gridCenterCoordinates, setGridCenterCoordinates] = useState([]);
    useEffect(() => {
        if (imgRef.current) {
            mapImageWidthRef.current = imgRef.current.offsetWidth;
        }
    }, []);

    // Calculate center coordinates for each grid cell
    const calculateGridCenterCoordinates = () => {
        if (imgRef.current) {
        const cellWidth = mapImageWidthRef.current / gridSize.cols;
        const cellHeight = imgRef.current.offsetHeight / gridSize.rows;
            const coordinates = {};
        for (let row = 0; row < gridSize.rows; row++) {
            for (let col = 0; col < gridSize.cols; col++) {
                const centerX = col * cellWidth + cellWidth / 2;
                const centerY = row * cellHeight + cellHeight / 2;
                    coordinates[`${row}-${col}`] = { x: centerX, y: centerY };
            }
        }
            setGridCenterCoordinates(coordinates);
            if (typeof onGridCenterCoordinates === 'function') {
                onGridCenterCoordinates(coordinates);
            }
        }
    };

    useEffect(() => {
        calculateGridCenterCoordinates();
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
                grid.push(
                    <div
                        key={`${row}-${col}`}
                        className={styles['grid-cell']}
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
    onGridCenterCoordinates: PropTypes.func,
};

export default GameMap;