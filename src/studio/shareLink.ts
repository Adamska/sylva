import { speciesSchema, type Species } from '@/types/botany';

const HASH_KEY = 's';

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export function buildShareUrl(species: Species): string {
  const url = new URL(window.location.href);
  url.hash = `${HASH_KEY}=${toBase64Url(JSON.stringify(species))}`;
  return url.toString();
}

export function readSharedSpecies(hash: string): Species | null {
  const encoded = new URLSearchParams(hash.replace(/^#/, '')).get(HASH_KEY);
  if (!encoded) return null;
  try {
    const parsed = speciesSchema.safeParse(JSON.parse(fromBase64Url(encoded)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
