'use client';

import { MOODS } from '@/scene/moods';
import { useBotanyStore } from '@/store/useBotanyStore';
import { LIGHTING_MOODS, PARAMETER_RANGES, type NumericRange } from '@/types/botany';
import { PaletteControls } from './PaletteControls';
import { RangeField } from './ui/RangeField';
import { Section } from './ui/Section';
import { Segmented } from './ui/Segmented';
import { Toggle } from './ui/Toggle';

const UNIT = { min: 0, max: 1, step: 0.01 } as const satisfies NumericRange;
const WIND_RANGES = {
  strength: { min: 0, max: 2, step: 0.01 },
  speed: { min: 0, max: 3, step: 0.01 },
  turbulence: { min: 0, max: 2.5, step: 0.01 },
  headingDeg: { min: 0, max: 360, step: 1 },
} as const satisfies Record<string, NumericRange>;
const SHADING_RANGE = { min: 0, max: 2.5, step: 0.01 } as const satisfies NumericRange;
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

const moodOptions = LIGHTING_MOODS.map((mood) => ({ value: mood, label: MOODS[mood].label }));

export function AtmosphereControls() {
  const wind = useBotanyStore((state) => state.wind);
  const shading = useBotanyStore((state) => state.shading);
  const life = useBotanyStore((state) => state.life);
  const mood = useBotanyStore((state) => state.species.mood);
  const glow = useBotanyStore((state) => state.species.palette.glow);
  const autoRotate = useBotanyStore((state) => state.autoRotate);
  const grove = useBotanyStore((state) => state.grove);
  const setWind = useBotanyStore((state) => state.setWind);
  const setShading = useBotanyStore((state) => state.setShading);
  const setLife = useBotanyStore((state) => state.setLife);
  const setMood = useBotanyStore((state) => state.setMood);
  const setPalette = useBotanyStore((state) => state.setPalette);
  const toggleAutoRotate = useBotanyStore((state) => state.toggleAutoRotate);
  const toggleGrove = useBotanyStore((state) => state.toggleGrove);
  const setPresenting = useBotanyStore((state) => state.setPresenting);

  return (
    <>
      <Section title="Life">
        <RangeField label="Age" value={life.age} range={UNIT} onChange={(age) => setLife({ age })} />
        <RangeField label={`Season · ${SEASONS[Math.min(3, Math.floor(life.season * 4))]}`} value={life.season} range={UNIT} onChange={(season) => setLife({ season })} />
      </Section>

      <Section title="Palette" defaultOpen={false}>
        <PaletteControls />
        <RangeField label="Bioluminescence" value={glow} range={PARAMETER_RANGES.glow} onChange={(value) => setPalette({ glow: value })} />
      </Section>

      <Section title="Wind" defaultOpen={false}>
        <RangeField label="Strength" value={wind.strength} range={WIND_RANGES.strength} onChange={(strength) => setWind({ strength })} />
        <RangeField label="Tempo" value={wind.speed} range={WIND_RANGES.speed} onChange={(speed) => setWind({ speed })} />
        <RangeField label="Turbulence" value={wind.turbulence} range={WIND_RANGES.turbulence} onChange={(turbulence) => setWind({ turbulence })} />
        <RangeField label="Heading" value={wind.headingDeg} range={WIND_RANGES.headingDeg} unit="°" onChange={(headingDeg) => setWind({ headingDeg })} />
        <RangeField label="Leaf flutter" value={shading.flutter} range={SHADING_RANGE} onChange={(flutter) => setShading({ flutter })} />
      </Section>

      <Section title="Stage">
        <Segmented label="Mood" value={mood} options={moodOptions} onChange={setMood} />
        <div className="flex gap-1.5">
          <Toggle label="Orbit" pressed={autoRotate} onToggle={toggleAutoRotate} hint="Slow camera turn (O)" />
          <Toggle label="Grove" pressed={grove} onToggle={toggleGrove} hint="Grow siblings from other seeds (G)" />
          <Toggle label="Present" pressed={false} onToggle={() => setPresenting(true)} hint="Hide the interface and cycle species (P)" />
        </div>
        <RangeField label="Leaf translucency" value={shading.translucency} range={SHADING_RANGE} onChange={(translucency) => setShading({ translucency })} />
        <RangeField label="Bark relief" value={shading.barkRelief} range={SHADING_RANGE} onChange={(barkRelief) => setShading({ barkRelief })} />
        <RangeField label="Bloom" value={shading.bloom} range={{ min: 0, max: 2, step: 0.01 }} onChange={(bloom) => setShading({ bloom })} />
        <RangeField label="Haze" value={shading.haze} range={{ min: 0, max: 2, step: 0.01 }} onChange={(haze) => setShading({ haze })} />
        <RangeField label="Depth of field" value={shading.depthOfField} range={UNIT} onChange={(depthOfField) => setShading({ depthOfField })} />
      </Section>
    </>
  );
}
