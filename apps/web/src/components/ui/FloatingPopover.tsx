'use client';

import { createPortal } from 'react-dom';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export type PopoverPlacement = 'right' | 'left' | 'top' | 'bottom';

type FloatingPopoverProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  title?: string;
  /** Desktop popover width in px */
  width?: number;
  /** Use bottom sheet on viewports below this width */
  mobileMaxWidth?: number;
  /** z-index layer */
  zIndex?: number;
  ariaLabel?: string;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function computePlacement(
  anchor: DOMRect,
  popW: number,
  popH: number,
  vw: number,
  vh: number,
): { placement: PopoverPlacement; top: number; left: number } {
  const gap = 10;
  const pad = 12;
  const space = {
    right: vw - anchor.right - gap,
    left: anchor.left - gap,
    top: anchor.top - gap,
    bottom: vh - anchor.bottom - gap,
  };
  const order: PopoverPlacement[] = ['right', 'left', 'top', 'bottom'];
  const fits = (p: PopoverPlacement) => {
    if (p === 'right') return space.right >= popW;
    if (p === 'left') return space.left >= popW;
    if (p === 'top') return space.top >= popH;
    return space.bottom >= popH;
  };
  const placement = order.find(fits) ?? 'bottom';
  let top = 0;
  let left = 0;
  if (placement === 'right') {
    left = anchor.right + gap;
    top = clamp(anchor.top, pad, vh - popH - pad);
  } else if (placement === 'left') {
    left = anchor.left - popW - gap;
    top = clamp(anchor.top, pad, vh - popH - pad);
  } else if (placement === 'top') {
    top = anchor.top - popH - gap;
    left = clamp(anchor.left, pad, vw - popW - pad);
  } else {
    top = anchor.bottom + gap;
    left = clamp(anchor.left, pad, vw - popW - pad);
  }
  return { placement, top, left };
}

export function FloatingPopover({
  open,
  onClose,
  anchorRef,
  children,
  title,
  width = 340,
  mobileMaxWidth = 639,
  zIndex = 95,
  ariaLabel,
  className = '',
}: FloatingPopoverProps) {
  const uid = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [style, setStyle] = useState<{ top: number; left: number; placement: PopoverPlacement } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${mobileMaxWidth}px)`);
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [mobileMaxWidth]);

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel || mobile) return;
    const rect = anchor.getBoundingClientRect();
    const popW = panel.offsetWidth || width;
    const popH = panel.offsetHeight || 320;
    const next = computePlacement(rect, popW, popH, window.innerWidth, window.innerHeight);
    setStyle(next);
  }, [anchorRef, mobile, width]);

  useLayoutEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    reposition();
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [open, reposition, mobile]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => reposition();
    const onResize = () => reposition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !mobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mobile]);

  useEffect(() => {
    if (!open || mobile) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    window.addEventListener('pointerdown', onPointer);
    return () => window.removeEventListener('pointerdown', onPointer);
  }, [open, mobile, onClose, anchorRef]);

  if (!mounted || !open) return null;

  const panelClass = `tnb-popover rounded-[20px] border border-white/70 bg-white/[0.97] p-4 shadow-[0_20px_50px_rgba(17,24,39,0.18)] backdrop-blur-md ${className}`;

  if (mobile) {
    return createPortal(
      <div
        className="fixed inset-0 flex items-end justify-center bg-navy/45"
        style={{ zIndex }}
        role="dialog"
        aria-modal
        aria-label={ariaLabel ?? title ?? 'Sélection'}
      >
        <button type="button" className="absolute inset-0" aria-label="Fermer" onClick={onClose} />
        <div
          ref={panelRef}
          className={`tnb-popover-sheet relative w-full max-h-[75vh] overflow-y-auto rounded-t-[1.75rem] border border-white/60 bg-white/[0.98] p-5 pb-8 shadow-2xl backdrop-blur-md ${visible ? 'tnb-popover-in' : 'opacity-0'}`}
        >
          {title ? (
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-ink">{title}</p>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"
                onClick={onClose}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          ) : null}
          {children}
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      ref={panelRef}
      id={uid}
      role="dialog"
      aria-label={ariaLabel ?? title ?? 'Sélection'}
      className={`${panelClass} fixed ${visible ? 'tnb-popover-in' : 'pointer-events-none opacity-0'}`}
      style={{
        zIndex,
        top: style?.top ?? -9999,
        left: style?.left ?? -9999,
        width,
        maxWidth: `min(${width}px, calc(100vw - 24px))`,
      }}
    >
      {title ? <p className="mb-3 text-sm font-semibold text-ink">{title}</p> : null}
      {children}
    </div>,
    document.body,
  );
}
