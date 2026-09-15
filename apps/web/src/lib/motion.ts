'use client';

import { useEffect, useState } from 'react';

/** Courbe partagée : entrée douce, arrêt naturel. */
export const MOTION_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return reduce;
}

/** Progrès 0→1 sur les `rangePx` premiers pixels de scroll. */
export function useScrollProgress(rangePx = 140, enabled = true): number {
  const [progress, setProgress] = useState(enabled ? 0 : 1);

  useEffect(() => {
    if (!enabled) {
      const t = window.setTimeout(() => setProgress(1), 0);
      return () => window.clearTimeout(t);
    }
    let raf = 0;
    const update = () => {
      setProgress(Math.min(1, Math.max(0, window.scrollY / rangePx)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, rangePx]);

  return progress;
}
