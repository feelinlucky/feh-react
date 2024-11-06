import React from 'react';
import Sprite from '../sprite/Sprite';
import PropTypes from 'prop-types';
import styles from './SingleCharacterStatUI.module.css';

const SingleCharacterStatUI = ({ CharacterStatType }) => {
  return (
    <div className={styles.statContainer}>
      <Sprite spriteName="UiStatBg" />
      <div className={styles.statText}>
        {CharacterStatType}
      </div>
    </div>
  );
};

SingleCharacterStatUI.propTypes = {
  CharacterStatType: PropTypes.string.isRequired,
};

export default SingleCharacterStatUI;
