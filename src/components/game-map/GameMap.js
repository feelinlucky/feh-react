import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './GameMap.module.css';
import { useLocation } from 'react-router-dom';
import Sprite from '../sprite/Sprite';
import MockChild from '../mock-child/MockChild';

const publicFolder = `${process.env.PUBLIC_URL}`;

const GameMap = ({ onGridClick }) => {
    const mapImage = `${process.env.PUBLIC_URL}/assets/images/map/Map_S0001.jpg`;
    const imgRef = useRef(null);
    let mapImageWidth = 0;

    useEffect(() => {
        if (imgRef.current) {
            mapImageWidth = imgRef.current.offsetWidth;
        }
    }, []);

    const handleGridClick = (row, col) => {
        if (typeof onGridClick === 'function') {
        onGridClick(row, col); 
        } else {
            console.error('onGridClick is not a function');
        }
    };

    const renderGrid = () => {
        const rows = 6;
        const cols = 8;
        const grid = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
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
};

export default GameMap;