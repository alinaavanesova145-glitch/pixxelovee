import { Application, Container, Graphics } from 'pixi.js';
import type { AmbientEffectType } from '@/types/story';

export interface AmbientEffectHandle {
  destroy: () => void;
}

interface Particle {
  gfx: Graphics;
  speed: number;
  drift: number;
}

/** Pixelated rain / snow / firefly ambience, drawn as simple animated primitives. */
export function createAmbientEffect(
  app: Application,
  type: AmbientEffectType,
  intensity = 0.5
): AmbientEffectHandle {
  if (type === 'none') return { destroy: () => {} };

  const layer = new Container();
  app.stage.addChild(layer);

  const count = Math.round(40 + intensity * 120);
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const gfx = new Graphics();
    if (type === 'rain') {
      gfx.rect(0, 0, 1, 12).fill({ color: 0xbfd8ff, alpha: 0.5 });
    } else if (type === 'snow') {
      gfx.circle(0, 0, 1.5 + Math.random() * 1.5).fill({ color: 0xffffff, alpha: 0.85 });
    } else {
      gfx.circle(0, 0, 2).fill({ color: 0xffe27a, alpha: 0.9 });
    }
    gfx.x = Math.random() * app.screen.width;
    gfx.y = Math.random() * app.screen.height;
    layer.addChild(gfx);

    particles.push({
      gfx,
      speed: type === 'rain' ? 8 + Math.random() * 6 : 1 + Math.random() * 1.5,
      drift: (Math.random() - 0.5) * (type === 'snow' ? 0.6 : 0.2),
    });
  }

  const tick = () => {
    const { width, height } = app.screen;
    for (const p of particles) {
      p.gfx.y += p.speed;
      p.gfx.x += p.drift + (type === 'fireflies' ? Math.sin(p.gfx.y * 0.05) * 0.3 : 0);
      if (p.gfx.y > height) {
        p.gfx.y = -10;
        p.gfx.x = Math.random() * width;
      }
      if (p.gfx.x > width) p.gfx.x = 0;
      if (p.gfx.x < 0) p.gfx.x = width;
    }
  };

  app.ticker.add(tick);

  return {
    destroy: () => {
      app.ticker.remove(tick);
      layer.destroy({ children: true });
    },
  };
}
