'use client';

import { Suspense, useEffect, useRef, useState } from 'react';

import { RideRequestForm } from '@/components/RideRequestForm';
import { brand } from '@/config/brand';
import { videos } from '@/config/media';
import { usePrefersReducedMotion } from '@/lib/motion';

function HeroMedia({ reduce }: { reduce: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduce) {
      v.pause();
      return;
    }
    void v.play().catch(() => undefined);
  }, [reduce]);

  if (reduce) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={videos.heroPoster} alt="" className="tnb-hero-video" />
    );
  }

  return (
    <video
      ref={videoRef}
      className="tnb-hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={videos.heroPoster}
      controls={false}
      aria-hidden
    >
      <source src={videos.heroMp4} type="video/mp4" />
    </video>
  );
}

export function HeroVideo() {
  const reduce = usePrefersReducedMotion();
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setShift(Math.min(32, window.scrollY * 0.08));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduce]);

  return (
    <section className="relative isolate min-h-[90svh] overflow-hidden bg-ink text-white lg:min-h-[100svh]">
      <div className="animate-media-in absolute inset-0">
        <div
          className="absolute inset-0 overflow-hidden"
          style={reduce ? undefined : { transform: `translate3d(0, ${shift}px, 0) scale(1.05)` }}
        >
          <HeroMedia reduce={reduce} />
        </div>
      </div>

      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/35 to-ink/15" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-ink/40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_140px_rgba(17,24,39,0.35)]"
      />

      <div className="tnb-shell relative z-10 flex min-h-[90svh] flex-col justify-end pb-16 pt-28 lg:min-h-[100svh] lg:justify-center lg:pb-24 lg:pt-32">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] lg:items-center">
          <div>
            <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.22em] text-white/80">
              {brand.appName}
            </p>
            <h1
              className="animate-fade-up mt-3 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{ animationDelay: '80ms' }}
            >
              {brand.heroTitle}
            </h1>
            <p
              className="animate-fade-up mt-4 max-w-lg text-lg text-white/85 sm:text-xl"
              style={{ animationDelay: '160ms' }}
            >
              {brand.heroDescription}
            </p>
          </div>

          <div id="reservation" className="animate-fade-up w-full" style={{ animationDelay: '220ms' }}>
            <Suspense fallback={<div className="h-80 rounded-[1.75rem] bg-white/90" />}>
              <RideRequestForm compact />
            </Suspense>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-[#fafaf8]"
      />
    </section>
  );
}
