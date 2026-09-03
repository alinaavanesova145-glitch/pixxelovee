'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Application, Assets, Sprite, type Texture } from 'pixi.js';
import type { Hotspot, StoryScene } from '@/types/story';
import { AudioManager } from '@/lib/audio/AudioManager';
import { createAmbientEffect, type AmbientEffectHandle } from '@/lib/pixi/ambientEffects';
import { AudioUnlockOverlay } from '@/components/story/AudioUnlockOverlay';
import { SecretMessageModal } from '@/components/story/SecretMessageModal';
import { StoryFooter } from '@/components/story/StoryFooter';

interface StoryViewerProps {
  scene: StoryScene;
}

export function StoryViewer({ scene }: StoryViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const audioRef = useRef<AudioManager>(new AudioManager());
  const ambientRef = useRef<AmbientEffectHandle | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const app = new Application();

    (async () => {
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: false, // keep pixel art crisp — no smoothing on scale
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }
      appRef.current = app;
      host.appendChild(app.canvas);

      // Load background + every hotspot's default/hover texture in one batch,
      // keyed by URL so we don't have to juggle parallel arrays.
      const urls = Array.from(
        new Set([
          scene.background.image,
          ...scene.hotspots.flatMap((h) => [h.sprite, h.hoverSprite].filter(Boolean) as string[]),
        ])
      );
      const textures = (await Assets.load(urls)) as Record<string, Texture>;

      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }

      const bg = new Sprite(textures[scene.background.image]);
      bg.anchor.set(0.5);
      app.stage.addChild(bg);

      const hotspotSprites = scene.hotspots.map((hotspot) => {
        const defaultTex = textures[hotspot.sprite];
        const hoverTex = hotspot.hoverSprite ? textures[hotspot.hoverSprite] : undefined;

        const sprite = new Sprite(defaultTex);
        sprite.anchor.set(0.5);
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';

        sprite.on('pointerover', () => {
          sprite.scale.set(1.08);
          if (hoverTex) sprite.texture = hoverTex;
        });
        sprite.on('pointerout', () => {
          sprite.scale.set(1);
          sprite.texture = defaultTex;
        });
        sprite.on('pointertap', () => {
          setActiveHotspot(hotspot);
          if (hotspot.sound) audioRef.current.playSfx(hotspot.sound);
        });

        app.stage.addChild(sprite);
        return { hotspot, sprite };
      });

      // Background is scaled "cover" style to fill the canvas; hotspots are
      // stored as 0–1 fractions of the background art, so they stay pinned
      // to the right spot on the art at any viewport size.
      const layout = () => {
        const { width, height } = app.screen;
        const scale = Math.max(width / scene.background.width, height / scene.background.height);

        bg.scale.set(scale);
        bg.x = width / 2;
        bg.y = height / 2;

        const originX = bg.x - (scene.background.width * scale) / 2;
        const originY = bg.y - (scene.background.height * scale) / 2;

        for (const { hotspot, sprite } of hotspotSprites) {
          sprite.x = originX + hotspot.x * scene.background.width * scale;
          sprite.y = originY + hotspot.y * scene.background.height * scale;
          sprite.width = hotspot.width * scene.background.width * scale;
          sprite.height = hotspot.height * scene.background.height * scale;
        }
      };

      layout();
      app.renderer.on('resize', layout);

      if (scene.ambient.effect !== 'none') {
        ambientRef.current = createAmbientEffect(app, scene.ambient.effect, scene.ambient.intensity);
      }

      const sfxUrls = scene.hotspots.map((h) => h.sound).filter(Boolean) as string[];
      if (sfxUrls.length) await audioRef.current.preloadSfx(sfxUrls);

      if (cancelled) return;
      setIsReady(true);
    })();

    return () => {
      cancelled = true;
      ambientRef.current?.destroy();
      ambientRef.current = null;
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
      audioRef.current.destroy();
    };
  }, [scene]);

  const handleUnlock = useCallback(async () => {
    await audioRef.current.unlock();
    if (scene.music?.url) {
      await audioRef.current.playMusic(scene.music.url, scene.music.volume, scene.music.loop);
    }
    setIsUnlocked(true);
  }, [scene.music]);

  return (
    <div className="relative h-full w-full bg-black">
      <div ref={hostRef} className="absolute inset-0" />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="animate-pulse font-pixel text-xs text-[#FFB6C1]">loading your story...</p>
        </div>
      )}

      {isReady && !isUnlocked && <AudioUnlockOverlay onUnlock={handleUnlock} />}

      <SecretMessageModal hotspot={activeHotspot} onClose={() => setActiveHotspot(null)} />

      {isUnlocked && <StoryFooter ctaText={scene.footerCta.text} ctaUrl={scene.footerCta.url} />}
    </div>
  );
}
