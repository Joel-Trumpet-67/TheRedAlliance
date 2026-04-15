import { useEffect, useState } from 'react';
import anime from 'animejs';

/** Animates a number from 0 to `target` on mount. */
export function useCountUp(target: number, duration = 1300): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const obj = { val: 0 };
    anime({
      targets: obj,
      val: target,
      duration,
      easing: 'easeOutExpo',
      round: 1,
      update() { setValue(Math.round(obj.val)); },
    });
  }, [target, duration]);

  return value;
}
