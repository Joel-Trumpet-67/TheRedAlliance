import { useEffect, useLayoutEffect, useRef } from 'react';
import anime from 'animejs';

/** Fades + slides an element up when it first enters the viewport. */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: { delay?: number; duration?: number; translateY?: number } = {}
) {
  const ref = useRef<T>(null);

  // Set before paint to avoid flash of visible content
  useLayoutEffect(() => {
    if (ref.current) ref.current.style.opacity = '0';
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.unobserve(el);
        anime({
          targets: el,
          opacity: [0, 1],
          translateY: [options.translateY ?? 16, 0],
          duration: options.duration ?? 640,
          delay: options.delay ?? 0,
          easing: 'easeOutCubic',
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
