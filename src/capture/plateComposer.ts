import type { SpecimenStats } from '@/engine/meshBuilder';
import type { Species } from '@/types/botany';

export const PLATE_PORTRAIT = { width: 2000, height: 1900 } as const;

const PAGE = { width: 2400, height: 3200, margin: 200 } as const;
const INK = '#2a251d';
const FADED = '#756b58';
const PAPER = '#efe7d6';

interface Fonts {
  serif: string;
  sans: string;
  mono: string;
}

function readFonts(): Fonts {
  const style = getComputedStyle(document.documentElement);
  const family = (name: string, fallback: string) => `${style.getPropertyValue(name).trim() || fallback}, ${fallback}`;
  return { serif: family('--font-instrument', 'Georgia, serif'), sans: family('--font-geist', 'Helvetica, sans-serif'), mono: family('--font-plex-mono', 'Menlo, monospace') };
}

function wrapText(context: CanvasRenderingContext2D, text: string, width: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const character of text) {
    if (context.measureText(line + character).width > width) {
      lines.push(line);
      line = '';
    }
    line += character;
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  return [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1].slice(0, -1)}…`];
}

function drawPaper(context: CanvasRenderingContext2D): void {
  context.fillStyle = PAPER;
  context.fillRect(0, 0, PAGE.width, PAGE.height);
  const shade = context.createRadialGradient(PAGE.width / 2, PAGE.height * 0.42, 600, PAGE.width / 2, PAGE.height / 2, 2100);
  shade.addColorStop(0, 'rgba(255, 252, 240, 0.5)');
  shade.addColorStop(1, 'rgba(120, 96, 60, 0.2)');
  context.fillStyle = shade;
  context.fillRect(0, 0, PAGE.width, PAGE.height);

  context.fillStyle = 'rgba(70, 55, 30, 0.035)';
  for (let fleck = 0; fleck < 9000; fleck++) {
    context.fillRect(Math.random() * PAGE.width, Math.random() * PAGE.height, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  context.strokeStyle = 'rgba(42, 37, 29, 0.55)';
  context.lineWidth = 3;
  context.strokeRect(90, 90, PAGE.width - 180, PAGE.height - 180);
  context.lineWidth = 1;
  context.strokeRect(106, 106, PAGE.width - 212, PAGE.height - 212);
}

function findBaseline(portrait: HTMLCanvasElement): number {
  const strip = { x: Math.round(portrait.width * 0.42), width: Math.round(portrait.width * 0.16) };
  const pixels = portrait.getContext('2d')?.getImageData(strip.x, 0, strip.width, portrait.height).data;
  if (!pixels) return portrait.height * 0.9;
  for (let y = portrait.height - 1; y >= 0; y--) {
    let covered = 0;
    for (let x = 0; x < strip.width; x++) if (pixels[(y * strip.width + x) * 4 + 3] > 200) covered++;
    if (covered > 12) return y;
  }
  return portrait.height * 0.9;
}

function rule(context: CanvasRenderingContext2D, y: number): void {
  context.fillStyle = 'rgba(42, 37, 29, 0.35)';
  context.fillRect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 2);
}

function heading(context: CanvasRenderingContext2D, fonts: Fonts, text: string, x: number, y: number): void {
  context.font = `500 22px ${fonts.sans}`;
  context.letterSpacing = '5px';
  context.fillStyle = FADED;
  context.fillText(text, x, y);
  context.letterSpacing = '0px';
}

export async function composePlate(portrait: HTMLCanvasElement, species: Species, stats: SpecimenStats): Promise<HTMLCanvasElement> {
  const fonts = readFonts();
  await Promise.all([document.fonts.load(`150px ${fonts.serif}`), document.fonts.load(`italic 70px ${fonts.serif}`), document.fonts.load(`26px ${fonts.mono}`)]);

  const canvas = document.createElement('canvas');
  canvas.width = PAGE.width;
  canvas.height = PAGE.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('The plate canvas could not be created');
  const right = PAGE.width - PAGE.margin;
  drawPaper(context);

  context.fillStyle = INK;
  context.font = `56px ${fonts.serif}`;
  context.fillText('Sylva', PAGE.margin, 196);
  heading(context, fonts, 'BOTANICAL GRAMMAR ATELIER', PAGE.margin + 170, 192);
  context.textAlign = 'right';
  context.font = `24px ${fonts.mono}`;
  context.fillStyle = FADED;
  context.fillText(`PLATE ${species.seed.toString(16).padStart(8, '0').toUpperCase()}`, right, 192);
  context.textAlign = 'left';
  rule(context, 232);

  const base = 270 + findBaseline(portrait);
  context.save();
  context.translate(PAGE.width / 2, base);
  context.scale(1, 0.16);
  const ground = context.createRadialGradient(0, 0, 10, 0, 0, 640);
  ground.addColorStop(0, 'rgba(42, 37, 29, 0.34)');
  ground.addColorStop(1, 'rgba(42, 37, 29, 0)');
  context.fillStyle = ground;
  context.fillRect(-700, -700, 1400, 1400);
  context.restore();
  context.drawImage(portrait, PAGE.margin, 270, PLATE_PORTRAIT.width, PLATE_PORTRAIT.height);

  context.textAlign = 'center';
  context.font = `italic 30px ${fonts.serif}`;
  context.fillStyle = FADED;
  context.fillText(`Fig. 1. Habit after ${stats.generations} generations, ${stats.height.toFixed(2)} units tall.`, PAGE.width / 2, 2238);
  context.textAlign = 'left';

  context.fillStyle = INK;
  context.font = `150px ${fonts.serif}`;
  context.fillText(wrapText(context, species.name, PAGE.width - PAGE.margin * 2, 1)[0], PAGE.margin - 6, 2440);
  context.font = `italic 70px ${fonts.serif}`;
  context.fillStyle = FADED;
  context.fillText(species.latin, PAGE.margin, 2540);
  rule(context, 2596);

  heading(context, fonts, 'GRAMMAR', PAGE.margin, 2664);
  context.font = `26px ${fonts.mono}`;
  context.fillStyle = INK;
  const sentences = [`axiom  ${species.grammar.axiom}`, ...species.grammar.rules.map((entry) => `${entry.symbol} → ${entry.successor || 'ε'}`)];
  const lines = sentences.flatMap((sentence) => wrapText(context, sentence, 1000, 3)).slice(0, 11);
  lines.forEach((line, index) => context.fillText(line, PAGE.margin, 2716 + index * 38));

  heading(context, fonts, 'PARAMETERS', 1300, 2664);
  const parameters: [string, string][] = [
    ['Iterations', String(species.grammar.iterations)],
    ['Branch angle', `${species.grammar.angleDeg.toFixed(1)}°`],
    ['Step length', species.grammar.stepLength.toFixed(2)],
    ['Radius ratio', species.grammar.radiusScale.toFixed(2)],
    ['Gravity tropism', species.grammar.tropismGravity.toFixed(2)],
    ['Leaf shape', species.form.leafShape],
    ['Segments', stats.segments.toLocaleString('en-US')],
    ['Blades', stats.blades.toLocaleString('en-US')],
  ];
  parameters.forEach(([label, value], index) => {
    const y = 2716 + index * 44;
    context.font = `26px ${fonts.sans}`;
    context.fillStyle = FADED;
    context.fillText(label, 1300, y);
    context.textAlign = 'right';
    context.font = `26px ${fonts.mono}`;
    context.fillStyle = INK;
    context.fillText(value, 1740, y);
    context.textAlign = 'left';
  });

  heading(context, fonts, 'PALETTE', 1840, 2664);
  const { barkDark, barkLight, leafDeep, leafBright, subsurface, organ } = species.palette;
  [barkDark, barkLight, leafDeep, leafBright, subsurface, organ].forEach((colour, index) => {
    const y = 2700 + index * 58;
    context.fillStyle = colour;
    context.beginPath();
    context.arc(1862, y + 8, 20, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = 'rgba(42, 37, 29, 0.4)';
    context.stroke();
    context.font = `24px ${fonts.mono}`;
    context.fillStyle = INK;
    context.fillText(colour.toUpperCase(), 1904, y + 17);
  });

  return canvas;
}
