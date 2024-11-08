import React from 'react';
import PropTypes from 'prop-types';
import styles from './Sprite.module.css';

const Sprite = ({ spriteName, children }) => {
  if (!spriteName) {
    throw new Error('Missing required prop: spriteName');
  }

  const spriteSheet = {
    Weapon1: `${process.env.PUBLIC_URL}/assets/images/ui/UnitEdit.png`,
    PortraitAlfonse: `${process.env.PUBLIC_URL}/assets/images/portrait/87754.png`,
    UiStatBg: `${process.env.PUBLIC_URL}/assets/images/ui/Common_Window.png`,
  };

  const spriteData = {
    Weapon1: {
      position: { x: 0, y: 0 },
      dimension: { width: 72, height: 72 },
    },
    PortraitAlfonse: {
      position: { x: 5044, y: 7674 },
      dimension: { width: 472, height: 308 },
    },
    UiStatBg: {
      position: { x: 1561, y: 944 },
      dimension: { width: 73, height: 860 },
      rotate: true,
    }
  };

  const spriteInfo = spriteData[spriteName];
  if (!spriteInfo) {
    throw new Error(`No sprite data found for: ${spriteName}`);
  }

  const spritePosition = spriteInfo.position || { x: 0, y: 0 };
  const spriteDimension = spriteInfo.dimension || { width: 32, height: 32 };

  if (!spriteSheet[spriteName]) {
    throw new Error(`No sprite sheet found for: ${spriteName}`);
  }

  const style = {
    width: `${spriteDimension.width}px`,
    height: `${spriteDimension.height}px`,
    background: `url(${spriteSheet[spriteName]})`,
    backgroundPosition: `-${spritePosition.x}px -${spritePosition.y}px`,
    backgroundSize: `auto`,
    display: 'inline-block',
    transform: spriteInfo.rotate ? 'rotate(90deg)' : 'none',
    position: 'relative',
  };

  return (
    <div className={styles.sprite} style={style} data-testid="sprite">
      <div className={styles.textContainer} style={{ transform: spriteInfo.rotate ? 'rotate(-90deg)' : 'none' }}>
        {children}
      </div>
    </div>
  );
};

Sprite.propTypes = {
  spriteName: PropTypes.string.isRequired,
  children: PropTypes.node,
};

Sprite.defaultProps = {
  children: null,
};

export default Sprite;
