const ENTRIES: readonly (readonly [string, string])[] = [
  ['F', 'Draw a branch segment'],
  ['f', 'Move without drawing'],
  ['+ -', 'Yaw left and right'],
  ['& ^', 'Pitch down and up'],
  ['\\ /', 'Roll left and right'],
  ['|', 'Turn around'],
  ['[ ]', 'Start and finish a branch'],
  ['L', 'Leaf cluster'],
  ['K', 'Flower or fruit'],
  ['(n)', 'Argument: F(1.5) scales, +(35) sets degrees'],
  ['A-Z', 'Buds that grow through their rules'],
];

export function AlphabetLegend() {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-md border border-hairline bg-black/25 px-2.5 py-2">
      {ENTRIES.map(([symbol, meaning]) => (
        <div key={symbol} className="contents">
          <dt className="font-mono text-[11px] text-brass">{symbol}</dt>
          <dd className="text-[11px] leading-snug text-lichen">{meaning}</dd>
        </div>
      ))}
    </dl>
  );
}
