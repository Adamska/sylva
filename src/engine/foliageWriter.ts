import type { MeshData } from './meshData';

export interface OrganSpec {
  ox: number;
  oy: number;
  oz: number;
  ax: number;
  ay: number;
  az: number;
  flex: number;
  shade: number;
  rule: number;
  organ: number;
  phase: number;
}

export interface BladeSpec extends OrganSpec {
  rx: number;
  ry: number;
  rz: number;
  dx: number;
  dy: number;
  dz: number;
  sx: number;
  sy: number;
  sz: number;
  length: number;
  halfWidth: number;
  rows: number;
  droop: number;
  curl: number;
  fold: number;
  flutter: number;
  outline: (t: number) => number;
}

export const HINGE_SHARE = 0.5;
export const LEAF_ORGAN = 0;
export const PETAL_ORGAN = 1;
export const STAMEN_ORGAN = 2;
export const HEART_ORGAN = 3;

export const bladeVertexCount = (rows: number) => (rows + 1) * 3;
export const bladeIndexCount = (rows: number) => rows * 12;

export class FoliageWriter {
  private readonly positions: Float32Array;
  private readonly normals: Float32Array;
  private readonly uvs: Float32Array;
  private readonly anchors: Float32Array;
  private readonly axes: Float32Array;
  private readonly sway: Float32Array;
  private readonly phase: Float32Array;
  private readonly branchFactor: Float32Array;
  private readonly shade: Float32Array;
  private readonly rules: Float32Array;
  private readonly organs: Float32Array;
  private readonly indices: Uint32Array;
  private vertex = 0;
  private cursor = 0;

  constructor(vertexTotal: number, indexTotal: number) {
    this.positions = new Float32Array(vertexTotal * 3);
    this.normals = new Float32Array(vertexTotal * 3);
    this.uvs = new Float32Array(vertexTotal * 2);
    this.anchors = new Float32Array(vertexTotal * 3);
    this.axes = new Float32Array(vertexTotal * 3);
    this.sway = new Float32Array(vertexTotal);
    this.phase = new Float32Array(vertexTotal);
    this.branchFactor = new Float32Array(vertexTotal);
    this.shade = new Float32Array(vertexTotal);
    this.rules = new Float32Array(vertexTotal);
    this.organs = new Float32Array(vertexTotal);
    this.indices = new Uint32Array(indexTotal);
  }

  get vertexCount(): number {
    return this.vertex;
  }

  push(spec: OrganSpec, px: number, py: number, pz: number, nx: number, ny: number, nz: number, u: number, v: number, sway: number): void {
    const o = this.vertex * 3;
    this.positions[o] = px;
    this.positions[o + 1] = py;
    this.positions[o + 2] = pz;
    this.normals[o] = nx;
    this.normals[o + 1] = ny;
    this.normals[o + 2] = nz;
    this.anchors[o] = spec.ox;
    this.anchors[o + 1] = spec.oy;
    this.anchors[o + 2] = spec.oz;
    this.axes[o] = spec.ax;
    this.axes[o + 1] = spec.ay;
    this.axes[o + 2] = spec.az;
    this.uvs[this.vertex * 2] = u;
    this.uvs[this.vertex * 2 + 1] = v;
    this.sway[this.vertex] = sway;
    this.phase[this.vertex] = spec.phase;
    this.branchFactor[this.vertex] = spec.flex;
    this.shade[this.vertex] = spec.shade;
    this.rules[this.vertex] = spec.rule;
    this.organs[this.vertex] = spec.organ;
    this.vertex++;
  }

  triangles(corners: readonly number[]): void {
    this.indices.set(corners, this.cursor);
    this.cursor += corners.length;
  }

  blade(spec: BladeSpec): void {
    let { dx, dy, dz } = spec;
    const { sx, sy, sz, rows } = spec;
    let px = spec.ox + spec.rx;
    let py = spec.oy + spec.ry;
    let pz = spec.oz + spec.rz;
    const stride = spec.length / rows;
    const curlCos = Math.cos(spec.curl / rows);
    const curlSin = Math.sin(spec.curl / rows);

    for (let row = 0; row <= rows; row++) {
      const t = row / rows;
      const nx = dy * sz - dz * sy;
      const ny = dz * sx - dx * sz;
      const nz = dx * sy - dy * sx;
      const width = spec.halfWidth * Math.max(0, spec.outline(t));
      const lift = width * spec.fold;
      for (let column = -1; column <= 1; column++) {
        const edge = Math.abs(column);
        const tilt = -column * spec.fold;
        const tx = nx + sx * tilt;
        const ty = ny + sy * tilt;
        const tz = nz + sz * tilt;
        const normalLength = Math.hypot(tx, ty, tz) || 1;
        this.push(
          spec,
          px + sx * width * column + nx * lift * edge,
          py + sy * width * column + ny * lift * edge,
          pz + sz * width * column + nz * lift * edge,
          tx / normalLength,
          ty / normalLength,
          tz / normalLength,
          (column + 1) * 0.5,
          t,
          spec.flutter * (HINGE_SHARE + (1 - HINGE_SHARE) * t),
        );
      }
      if (row === rows) break;
      const base = this.vertex - 3;
      this.triangles([base, base + 3, base + 1, base + 1, base + 3, base + 4, base + 1, base + 4, base + 2, base + 2, base + 4, base + 5]);
      px += dx * stride;
      py += dy * stride;
      pz += dz * stride;
      dy -= (spec.droop / rows) * (0.6 + 0.8 * t);
      const bentX = dx * curlCos - nx * curlSin;
      const bentY = dy * curlCos - ny * curlSin;
      const bentZ = dz * curlCos - nz * curlSin;
      const directionLength = Math.hypot(bentX, bentY, bentZ) || 1;
      dx = bentX / directionLength;
      dy = bentY / directionLength;
      dz = bentZ / directionLength;
    }
  }

  toMesh(): MeshData {
    return {
      attributes: {
        position: { array: this.positions, itemSize: 3 },
        normal: { array: this.normals, itemSize: 3 },
        uv: { array: this.uvs, itemSize: 2 },
        aAnchor: { array: this.anchors, itemSize: 3 },
        aAxis: { array: this.axes, itemSize: 3 },
        aSway: { array: this.sway, itemSize: 1 },
        aPhase: { array: this.phase, itemSize: 1 },
        aBranchFactor: { array: this.branchFactor, itemSize: 1 },
        aShade: { array: this.shade, itemSize: 1 },
        aRule: { array: this.rules, itemSize: 1 },
        aOrgan: { array: this.organs, itemSize: 1 },
      },
      index: this.indices,
    };
  }
}
