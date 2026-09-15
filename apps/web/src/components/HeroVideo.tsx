'use client';

import { Play } from 'lucide-react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { RideRequestForm } from '@/components/RideRequestForm';
import { brand } from '@/config/brand';
import { videos } from '@/config/media';
import { usePrefersReducedMotion } from '@/lib/motion';

function useSaveData() {
  const [saveData, setSaveData] = useState(false);
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setSaveData(Boolean(conn?.saveData));
  }, []);
  return saveData;
}

function useIsMobileViewport() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return mobile;
}

function HeroMedia({ reduce, saveData }: { reduce: boolean; saveData: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobile = useIsMobileViewport();
  const [needsTap, setNeedsTap] = useState(false);
  const [ready, setReady] = useState(false);

  const preferMobile = mobile && !saveData;
  const src = preferMobile ? videos.heroMp4Mobile : videos.heroMp4;
  const showVideo = !reduce && !saveData;

  const tryPlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !showVideo) return;
    v.muted = true;
    try {
      await v.play();
      setNeedsTap(false);
    } catch {
      setNeedsTap(true);
    }
  }, [showVideo]);

  useEffect(() => {
    void tryPlay();
  }, [tryPlay, src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => {
      setReady(true);
      void tryPlay();
    };
    v.addEventListener('canplay', onCanPlay);
    return () => v.removeEventListener('canplay', onCanPlay);
  }, [tryPlay, src]);

  if (!showVideo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={videos.heroPoster} alt="" className="tnb-hero-video tnb-hero-poster" />
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={videos.heroPoster}
        alt=""
        className={`tnb-hero-video tnb-hero-poster absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden
      />
      <video
        ref={videoRef}
        key={preferMobile ? 'mobile' : 'desktop'}
        className={`tnb-hero-video transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        muted
        loop
        playsInline
        preload={mobile ? 'auto' : 'metadata'}
        poster={videos.heroPoster}
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
      >
        <source src={src} type="video/mp4" />
      </video>
      {needsTap ? (
        <button
          type="button"
          className="absolute bottom-24 right-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-navy shadow-lg backdrop-blur sm:bottom-8"
          onClick={() => void tryPlay()}
          aria-label="Lancer la vidéo"
        >
          <Play className="h-5 w-5 fill-current" />
        </button>
      ) : null}
    </>
  );
}

export function HeroVideo() {
  const reduce = usePrefersReducedMotion();
  const saveData = useSaveData();
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
    <section className="relative isolate min-h-[88svh] overflow-hidden bg-ink text-white sm:min-h-[90svh] lg:min-h-[100svh]">
      <div className="animate-media-in absolute inset-0">
        <div
          className="absolute inset-0 overflow-hidden"
          style={reduce ? undefined : { transform: `translate3d(0, ${shift}px, 0) scale(1.05)` }}
        >
          <HeroMedia reduce={reduce} saveData={saveData} />
        </div>
      </div>

      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/78 via-ink/40 to-ink/20" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-ink/45" />
      <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_140px_rgba(17,24,39,0.35)]" />

      <div className="tnb-shell relative z-10 flex min-h-[88svh] flex-col justify-end pb-12 pt-24 sm:min-h-[90svh] sm:pb-16 sm:pt-28 lg:min-h-[100svh] lg:justify-center lg:pb-24 lg:pt-32">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)] lg:items-center lg:gap-8">
          <div className="max-lg:order-2">
            <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-sm">{brand.appName}</p>
            <h1
              className="animate-fade-up mt-2 max-w-3xl text-3xl font-bold leading-[1.05] tracking-tight sm:mt-3 sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{ animationDelay: '80ms' }}
            >
              {brand.heroTitle}
            </h1>
            <p className="animate-fade-up mt-3 max-w-lg text-base text-white/85 sm:mt-4 sm:text-xl" style={{ animationDelay: '160ms' }}>
              {brand.heroDescription}
            </p>
          </div>

          <div id="reservation" className="animate-fade-up w-full max-lg:order-1" style={{ animationDelay: '220ms' }}>
            <Suspense fallback={<div className="h-72 rounded-[1.75rem] bg-white/90 sm:h-80" />}>
              <RideRequestForm compact />
            </Suspense>
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-b from-transparent to-[#fafaf8] sm:h-24" />
    </section>
  );
}
