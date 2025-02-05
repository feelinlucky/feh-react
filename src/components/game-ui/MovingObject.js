import { useSpring, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { useEffect, useState } from 'react';

export function MovingObject({ DraggableCharacter, points }) {
  const [index, setIndex] = useState(0);
  const [props, set] = useSpring(() => ({
    from: { y: points[0][1], x: points[0][0] },
    config: { duration: 1000 }
  }));

  useEffect(() => {
    if (index < points.length - 1) {
      set({ y: points[index + 1][1], x: points[index + 1][0] });
      setIndex(index + 1);
    }
  }, [index, set, points]);

  const bind = useDrag(({ offset: [x, y] }) => {
    set({ x, y });
  });

  return (
    <animated.div
      {...bind()}
      style={{
        position: 'absolute',
        transform: props.x.to((x) => `translate(${x}px, ${props.y.get()}px)`)
      }}
    >
      <DraggableCharacter />
    </animated.div>
  );
}