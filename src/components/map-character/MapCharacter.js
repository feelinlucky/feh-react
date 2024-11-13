import React from 'react';

const MapCharacter = ({ characterName }) => {
    console.log('MapCharacter: ', characterName);
    const src = `${process.env.PUBLIC_URL}/assets/images/sprite/${characterName}_FEH_Sprite.webp`;
    return (
        <img
            data-testid="map-character"
            alt={`${characterName}'s Map Character`}
            src={src}
            style={{
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                width: 'auto',
                backgroundColor: 'transparent',
                minWidth: `${720 * 0.2}px`, // based on the width of 'CharacterStatUI'
                minHeight: `${1280 * 0.16}px`,
            }}
        />
    );
}

export default MapCharacter;
