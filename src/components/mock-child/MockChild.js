import React from 'react';

const MockChild = ({ componentName, ...props }) => {
  if (!props.backgroundColor) {
    console.warn('Background color is null or undefined');
  }

  const renderComponent = () => {
    const { screenWidth, screenHeight } = [720, 1280];

    const commonStyles = {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '8px', // Add indentation
      boxSizing: 'border-box', // Ensure padding is included in the width and height
    };

    switch (componentName) {
      case 'CharacterStatUI':
        
        return (
          <div
            data-testid="mock-character-stat-ui"
            style={{
              ...commonStyles,
              width: '100%',
              height: '16vh',
              backgroundColor: props.backgroundColor,
              minWidth: screenWidth,
              minHeight: `${1280 * 0.16}px`,
            }}
          >
            mock-character-stat-ui
          </div>
        );
      case 'SingleCharacterStatUI':
        const { characterStatType, characterStatValue } = props;
        return (
          <div
            data-testid="mock-single-character-stat-ui"
            style={{
              ...commonStyles,
              width: '40vw',
              height: `4vh`,
              backgroundColor: props.backgroundColor,
              minWidth: `${720 * 0.4}px`, // based on the width of 'CharacterStatUI'
              minHeight: `${1280 * 0.04}px`,
            }}
          >
            {characterStatType}: {characterStatValue}
          </div>
        );
      case 'CharacterStatPortrait':
        const { characterName } = props;
        return (
          <div
            data-testid="character-stat-portrait"
            style={{
              ...commonStyles,
              width: '20vw',
              height: '40px',
              backgroundColor: props.backgroundColor,
              minWidth: `${720 * 0.2}px`, // based on the width of 'CharacterStatUI'
              minHeight: `${1280 * 0.16}px`,
            }}
          >
            {characterName}'s Portrait
          </div>
        );
      default:
        return null;
    }
  };

  return renderComponent();
};

export default MockChild;