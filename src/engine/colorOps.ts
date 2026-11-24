export interface Hsl {
  hue: number;
  saturation: number;
  lightness: number;
}

export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const wrapped = ((hue % 360) + 360) % 360;
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const channel = (offset: number) => {
    const k = (offset + wrapped / 30) % 12;
    const value = lightness - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255).toString(16).padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

export function hexToHsl(hex: string): Hsl {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const range = max - min;
  if (range === 0) return { hue: 0, saturation: 0, lightness };

  const saturation = range / (1 - Math.abs(2 * lightness - 1));
  const sector = max === red ? ((green - blue) / range) % 6 : max === green ? (blue - red) / range + 2 : (red - green) / range + 4;
  return { hue: (sector * 60 + 360) % 360, saturation, lightness };
}

export function shiftHue(hex: string, degrees: number): string {
  const { hue, saturation, lightness } = hexToHsl(hex);
  return hslToHex(hue + degrees, saturation, lightness);
}
