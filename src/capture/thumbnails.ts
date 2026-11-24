import { requestBuild } from '@/engine/buildClient';
import { toGeometry } from '@/engine/geometry';
import { studio } from '@/scene/studioBridge';
import type { Species } from '@/types/botany';
import { renderPortrait } from './portraitStudio';

const THUMBNAIL_SIZE = { width: 264, height: 300 } as const;
const THUMBNAIL_DETAIL = 0.5;
const READY_POLL_MS = 120;

function whenRendererReady(): Promise<NonNullable<typeof studio.gl>> {
  return new Promise((resolve) => {
    const check = () => (studio.gl ? resolve(studio.gl) : setTimeout(check, READY_POLL_MS));
    check();
  });
}

export async function createThumbnail(species: Species): Promise<string> {
  const [gl, data] = await Promise.all([
    whenRendererReady(),
    requestBuild({ grammar: species.grammar, form: species.form, seed: species.seed, detail: THUMBNAIL_DETAIL }),
  ]);
  const bark = toGeometry(data.bark);
  const foliage = toGeometry(data.foliage);
  try {
    return renderPortrait(gl, { bark, foliage, stats: data.stats, species, ...THUMBNAIL_SIZE }).toDataURL('image/webp', 0.86);
  } finally {
    bark.dispose();
    foliage.dispose();
  }
}
