import React from 'react';
import Sprite from '../sprite/Sprite';
import PropTypes from 'prop-types';
import styles from './SingleCharacterStatUI.module.css';

const SingleCharacterStatUI = ({ characterStatType, characterStatValue, backgroundColor }) => {
  return (
    <div
      className={styles.statContainer}
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '8px',
        boxSizing: 'border-box',
        width: '40vw',
        height: '4vh',
        backgroundColor: backgroundColor,
        minWidth: `${720 * 0.4}px`,
        minHeight: `${1280 * 0.04}px`,
      }}
    >
      <Sprite spriteName="UiStatBg" className={styles.sprite} />
      <span className={styles.statText}>
    {characterStatType}: {characterStatValue}
      </span>
  </div>
  );
};

SingleCharacterStatUI.propTypes = {
  characterStatType: PropTypes.string.isRequired,
  characterStatValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  backgroundColor: PropTypes.string,
};

export default SingleCharacterStatUI;
