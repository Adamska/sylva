'use client';

import { MOODS } from '@/scene/moods';
import { useBotanyStore } from '@/store/useBotanyStore';
import { LIGHTING_MOODS, PARAMETER_RANGES, type NumericRange } from '@/types/botany';
import { RangeField } from './ui/RangeField';
import { Section } from './ui/Section';
import { Segmented } from './ui/Segmented';

const WIND_RANGES = {
  strength: { min: 0, max: 2, step: 0.01 },
  speed: { min: 0, max: 3, step: 0.01 },
  turbulence: { min: 0, max: 2.5, step: 0.01 },
  headingDeg: { min: 0, max: 360, step: 1 },
} as const satisfies Record<string, NumericRange>;

const SHADING_RANGES = {
  translucency: { min: 0, max: 2.5, step: 0.01 },
  barkRelief: { min: 0, max: 2.5, step: 0.01 },
  flutter: { min: 0, max: 2.5, step: 0.01 },
  bloom: { min: 0, max: 2, step: 0.01 },
} as const satisfies Record<string, NumericRange>;

const moodOptions = LIGHTING_MOODS.map((mood) => ({ value: mood, label: MOODS[mood].label }));

export function AtmosphereControls() {
  const wind = useBotanyStore((state) => state.wind);
  const shading = useBotanyStore((state) => state.shading);
  const mood = useBotanyStore((state) => state.species.mood);
  const glow = useBotanyStore((state) => state.species.palette.glow);
  const setWind = useBotanyStore((state) => state.setWind);
  const setShading = useBotanyStore((state) => state.setShading);
  const setMood = useBotanyStore((state) => state.setMood);
  const setPalette = useBotanyStore((state) => state.setPalette);

  return (
    <>
      <Section title="Wind">
        <RangeField label="Strength" value={wind.strength} range={WIND_RANGES.strength} onChange={(strength) => setWind({ strength })} />
        <RangeField label="Tempo" value={wind.speed} range={WIND_RANGES.speed} onChange={(speed) => setWind({ speed })} />
        <RangeField label="Turbulence" value={wind.turbulence} range={WIND_RANGES.turbulence} onChange={(turbulence) => setWind({ turbulence })} />
        <RangeField label="Heading" value={wind.headingDeg} range={WIND_RANGES.headingDeg} unit="°" onChange={(headingDeg) => setWind({ headingDeg })} />
        <RangeField label="Leaf flutter" value={shading.flutter} range={SHADING_RANGES.flutter} onChange={(flutter) => setShading({ flutter })} />
      </Section>

      <Section title="Light">
        <Segmented label="Mood" value={mood} options={moodOptions} onChange={setMood} />
        <RangeField
          label="Leaf translucency"
          value={shading.translucency}
          range={SHADING_RANGES.translucency}
          onChange={(translucency) => setShading({ translucency })}
        />
        <RangeField label="Bark relief" value={shading.barkRelief} range={SHADING_RANGES.barkRelief} onChange={(barkRelief) => setShading({ barkRelief })} />
        <RangeField label="Bioluminescence" value={glow} range={PARAMETER_RANGES.glow} onChange={(value) => setPalette({ glow: value })} />
        <RangeField label="Bloom" value={shading.bloom} range={SHADING_RANGES.bloom} onChange={(bloom) => setShading({ bloom })} />
      </Section>
    </>
  );
}
