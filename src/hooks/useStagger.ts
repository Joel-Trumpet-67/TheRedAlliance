import { useEffect, useRef } from 'react';
import anime from 'animejs';

/**
 * Attaches to a container and stagger-animates its direct children
 * whenever `deps` change (defaults to once on mount).
 */
export function useStagger<T extends HTMLElement = HTMLDivElement>(
  deps: unknown[] = [],
  options: { delay?: number; duration?: number } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const items = Array.from(ref.current.children);
    if (items.length === 0) return;

    anime({
      targets: items,
      opacity: [0, 1],
      translateY: [22, 0],
      delay: anime.stagger(options.delay ?? 55),
      duration: options.duration ?? 560,
      easing: 'easeOutExpo',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
