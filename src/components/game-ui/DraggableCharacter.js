const DraggableCharacter = ({
  charName,
  isDraggable,
  onCharacterActed,
  coordinates,
  isSelected,
  setParentIsDragging,
  setSelectedCharacter,
  setHighlightedCells,
  setNearestGridEdges,
  characterPositions,
  gridAnchorCoordinates,
  mapPosition,
  terrainData,
  setIsDropTriggered,
  updateLogText // Add updateLogText handler
}) => {
  const overlayRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = overlayRef.current;
    if (el && isDraggable) {
      const cleanup = draggable({
        element: el,
        data: {
          character: charName,
        },
        onDragStart: (event) => {
          setIsDragging(true);
          setParentIsDragging(true);

          // Ensure the character is selected and movement range is generated
          if (!isSelected) {
            setSelectedCharacter(charName);
            const char = characterData(charName);
            const gridPos = characterPositions[charName];
            const movementRange = calculateMovementRange(
              gridPos.row,
              gridPos.col,
              sharedProps.moveTypes[char.type].distance,
              char.type,
              terrainData
            );
            setHighlightedCells(movementRange);
          }
        },
        onDrag: (event) => {
          if (isDragging) {
          }
        },
        onDrop: () => {
          setIsDragging(false);
          onCharacterActed(charName); // Notify that the character has acted
          setParentIsDragging(false);
          setIsDropTriggered(true); // Set drop trigger state to true
        },
        onDragEnd: () => {
          setIsDragging(false);
          setParentIsDragging(false);
        },
      });

      return () => {
        cleanup?.();
      };
    }
  }, [
    charName,
    setSelectedCharacter,
    isSelected,
    isDraggable,
    isDragging,
    setParentIsDragging,
    onCharacterActed,
    setHighlightedCells,
    setNearestGridEdges,
    characterPositions,
    gridAnchorCoordinates,
    mapPosition,
    terrainData,
    setIsDropTriggered,
    updateLogText  
  ]);

  return (
    <div
      ref={overlayRef}
      className={styles['character-overlay']}
      style={{
        left: `${coordinates.x}px`,
        top: `${coordinates.y}px`,
        cursor: isSelected ? 'grab' : 'pointer',
        userSelect: 'none',
        pointerEvents: isSelected ? 'auto' : 'none',
        pointerEvents: isDraggable ? 'auto' : 'none', // Disable pointer events if not draggable
        opacity: isDragging ? 0.7 : 1,
        opacity: isDraggable ? 1 : 0.5, // Visually indicate non-draggable state
      }}
      data-dragging={isDragging}
    >
      <div style={{ pointerEvents: 'none' }}>
        <MapCharacter
          characterName={charName}
        />
      </div>
    </div>
  );
};
