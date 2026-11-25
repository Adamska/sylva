import type { FoliageWriter, OrganSpec } from './foliageWriter';

export interface OrbSpec extends OrganSpec {
  cx: number;
  cy: number;
  cz: number;
  nx: number;
  ny: number;
  nz: number;
  radius: number;
  squash: number;
  segments: number;
  rings: number;
  sway: number;
}

export const orbVertexCount = (segments: number, rings: number) => (segments + 1) * (rings + 1);
export const orbIndexCount = (segments: number, rings: number) => segments * rings * 6;

export function writeOrb(writer: FoliageWriter, spec: OrbSpec): void {
  const { nx, ny, nz, radius, squash, segments, rings } = spec;
  const first = writer.vertexCount;
  const upright = Math.abs(ny) > 0.9;
  let ux = upright ? 0 : nz;
  let uy = upright ? -nz : 0;
  let uz = upright ? ny : -nx;
  const length = Math.hypot(ux, uy, uz) || 1;
  ux /= length;
  uy /= length;
  uz /= length;
  const vx = uy * nz - uz * ny;
  const vy = uz * nx - ux * nz;
  const vz = ux * ny - uy * nx;

  for (let ring = 0; ring <= rings; ring++) {
    const polar = (ring / rings) * Math.PI;
    const rim = Math.sin(polar);
    const rise = Math.cos(polar);
    for (let segment = 0; segment <= segments; segment++) {
      const azimuth = (segment / segments) * Math.PI * 2;
      const rx = (ux * Math.cos(azimuth) + vx * Math.sin(azimuth)) * rim;
      const ry = (uy * Math.cos(azimuth) + vy * Math.sin(azimuth)) * rim;
      const rz = (uz * Math.cos(azimuth) + vz * Math.sin(azimuth)) * rim;
      const sx = rx * squash + nx * rise;
      const sy = ry * squash + ny * rise;
      const sz = rz * squash + nz * rise;
      const slope = Math.hypot(sx, sy, sz) || 1;
      writer.push(
        spec,
        spec.cx + (rx + nx * rise * squash) * radius,
        spec.cy + (ry + ny * rise * squash) * radius,
        spec.cz + (rz + nz * rise * squash) * radius,
        sx / slope,
        sy / slope,
        sz / slope,
        0.5,
        ring / rings,
        spec.sway,
      );
    }
  }

  const row = segments + 1;
  for (let ring = 0; ring < rings; ring++) {
    for (let segment = 0; segment < segments; segment++) {
      const a = first + ring * row + segment;
      writer.triangles([a, a + 1, a + row, a + 1, a + row + 1, a + row]);
    }
  }
}
