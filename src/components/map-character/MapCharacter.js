import React from 'react';

const MapCharacter = ({ characterName }) => {
    const src = `${process.env.PUBLIC_URL}/assets/images/sprite/${characterName}.png`;
    return (
        <img
            data-testid="map-character"
            alt={`${characterName}'s Map Character`}
            src={src}
            style={{
                display: 'flex',
                alignItems: 'center',
                height: 'auto',
                width: `${720 * 0.2}px`,  // based on the width of 'CharacterStatUI'
                backgroundColor: 'transparent',
            }}
        />
    );
}

export default MapCharacter;
