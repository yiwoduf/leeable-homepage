import { useEffect, useRef } from 'react';
import type { Hero3DVariant } from '../../types/design';
import { makeHero, type HeroController } from '../../lib/three/heroEngine';

interface Hero3DProps {
  accent: string;
  variant: Hero3DVariant;
  /** Motion factor, 0–1. */
  motion: number;
  dark: boolean;
}

/** Mounts the Three.js hero engine and forwards live prop changes to it. */
export function Hero3D({ accent, variant, motion, dark }: Hero3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ctrl = useRef<HeroController | null>(null);

  // Create once; the engine owns its own RAF loop and listeners.
  useEffect(() => {
    if (!ref.current) return;
    const controller = makeHero(ref.current, { accent, variant, motion, dark });
    ctrl.current = controller;
    return () => controller.destroy();
    // Initial props are captured on mount; later changes flow through the effects below.

  }, []);

  useEffect(() => ctrl.current?.setAccent(accent), [accent]);
  useEffect(() => ctrl.current?.setVariant(variant), [variant]);
  useEffect(() => ctrl.current?.setMotion(motion), [motion]);
  useEffect(() => ctrl.current?.setDark(dark), [dark]);

  return <div ref={ref} style={{ position: 'absolute', inset: 0 }} />;
}
