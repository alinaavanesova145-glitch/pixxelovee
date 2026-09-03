'use client';

import { useEffect, useRef } from 'react';
import { Application, Graphics } from 'pixi.js';
import { createAmbientEffect, type AmbientEffectHandle } from '@/lib/pixi/ambientEffects';

/**
 * Looping ambient scene for the landing hero — procedural pixel shapes only,
 * no external art. Real background/sprite assets aren't sourced yet (see
 * public/scenes/*), so this intentionally never references an image file.
 */
export function HeroPixiDemo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const ambientRef = useRef<AmbientEffectHandle | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const app = new Application();

    (async () => {
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: false,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }
      appRef.current = app;
      host.appendChild(app.canvas);

      const scene = new Graphics();
      app.stage.addChild(scene);

      const draw = () => {
        const { width, height } = app.screen;
        scene.clear();
        scene.rect(0, 0, width, height).fill({ color: 0x0f1115 });

        const winW = width * 0.28;
        const winH = height * 0.36;
        const winX = width / 2 - winW / 2;
        const winY = height * 0.18;
        scene.rect(winX, winY, winW, winH).fill({ color: 0x2a1f26, alpha: 0.9 });
        scene.rect(winX, winY, winW, winH).stroke({ color: 0xffb6c1, width: 2, alpha: 0.4 });

        scene.rect(width * 0.12, height * 0.72, width * 0.18, height * 0.14).fill({ color: 0x1a1c22 });
        scene.rect(width * 0.68, height * 0.68, width * 0.2, height * 0.18).fill({ color: 0x1a1c22 });
      };

      draw();
      app.renderer.on('resize', draw);

      if (cancelled) return;
      ambientRef.current = createAmbientEffect(app, 'snow', 0.3);
    })();

    return () => {
      cancelled = true;
      ambientRef.current?.destroy();
      ambientRef.current = null;
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
