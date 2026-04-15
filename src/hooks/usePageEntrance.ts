import { useEffect, useRef } from 'react';
import anime from 'animejs';

/** Fades + slides the page container up on mount. */
export function usePageEntrance<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    anime({
      targets: ref.current,
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 560,
      easing: 'easeOutExpo',
    });
  }, []);

  return ref;
}
