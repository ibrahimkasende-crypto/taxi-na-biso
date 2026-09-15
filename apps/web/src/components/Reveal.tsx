'use client';

import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/lib/motion';

export function Reveal({
  children,
  className = '',
  delayMs = 0,
  scale = false,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  scale?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      const t = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: reduce ? '0ms' : `${delayMs}ms` }}
      className={`tnb-reveal ${visible ? 'is-in' : ''} ${scale ? 'tnb-reveal-scale' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
