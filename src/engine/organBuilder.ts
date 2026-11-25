import type { OrganShape } from '@/types/botany';
import { FLOWER_PROFILES, type FlowerProfile } from './flowerProfiles';
import { bladeIndexCount, bladeVertexCount, HEART_ORGAN, HINGE_SHARE, PETAL_ORGAN, STAMEN_ORGAN, type BladeSpec, type FoliageWriter } from './foliageWriter';
import { orbIndexCount, orbVertexCount, writeOrb, type OrbSpec } from './orbWriter';
import type { Rng } from './random';

export interface OrganFrame {
  hx: number;
  hy: number;
  hz: number;
  lx: number;
  ly: number;
  lz: number;
  ux: number;
  uy: number;
  uz: number;
}

export type OrganScratch = BladeSpec & OrbSpec;

export interface OrganPlan {
  blades: number;
  vertices: number;
  indices: number;
  write: (writer: FoliageWriter, spec: OrganScratch, frame: OrganFrame, node: number, size: number, widen: number, rng: Rng) => void;
}

const GOLDEN_ANGLE = 2.39996323;
const DEG_TO_RAD = Math.PI / 180;
const BERRY_SEGMENTS = 6;
const BERRY_RINGS = 4;
const BERRY_SWAY = 0.5;
const WIDE_HEART = 0.4;

function planBerries(): OrganPlan {
  return {
    blades: 1,
    vertices: orbVertexCount(BERRY_SEGMENTS, BERRY_RINGS),
    indices: orbIndexCount(BERRY_SEGMENTS, BERRY_RINGS),
    write: (writer, spec, _frame, _node, size, widen, rng) => {
      spec.radius = size * 0.5 * (0.75 + 0.5 * rng()) * widen;
      spec.cx = spec.ox + (rng() - 0.5) * spec.radius;
      spec.cy = spec.oy - spec.radius * 1.3;
      spec.cz = spec.oz + (rng() - 0.5) * spec.radius;
      spec.phase = rng();
      spec.organ = PETAL_ORGAN;
      [spec.ax, spec.ay, spec.az] = [0, -1, 0];
      [spec.nx, spec.ny, spec.nz] = [0, 1, 0];
      spec.squash = 1;
      spec.segments = BERRY_SEGMENTS;
      spec.rings = BERRY_RINGS;
      spec.sway = BERRY_SWAY;
      writeOrb(writer, spec);
    },
  };
}

function planFlowers(profile: FlowerProfile, detail: number): OrganPlan {
  const rows = profile.whorls.map((whorl) => Math.max(1, Math.round(whorl.rows * detail)));
  const wide = profile.core >= WIDE_HEART;
  const segments = Math.max(5, Math.round((wide ? 16 : 8) * detail));
  const rings = wide ? 4 : 3;
  const tiltCos = Math.cos(profile.tiltDeg * DEG_TO_RAD);
  const tiltSin = Math.sin(profile.tiltDeg * DEG_TO_RAD);
  const hasHeart = profile.core > 0;

  return {
    blades: profile.whorls.reduce((total, whorl) => total + whorl.count, 0),
    vertices: profile.whorls.reduce((total, whorl, index) => total + whorl.count * bladeVertexCount(rows[index]), hasHeart ? orbVertexCount(segments, rings) : 0),
    indices: profile.whorls.reduce((total, whorl, index) => total + whorl.count * bladeIndexCount(rows[index]), hasHeart ? orbIndexCount(segments, rings) : 0),
    write: (writer, spec, frame, node, size, widen, rng) => {
      const roll = GOLDEN_ANGLE * node;
      let ax = frame.hx * tiltCos + (frame.lx * Math.cos(roll) + frame.ux * Math.sin(roll)) * tiltSin;
      let ay = frame.hy * tiltCos + (frame.ly * Math.cos(roll) + frame.uy * Math.sin(roll)) * tiltSin + profile.lift;
      let az = frame.hz * tiltCos + (frame.lz * Math.cos(roll) + frame.uz * Math.sin(roll)) * tiltSin;
      const axisLength = Math.hypot(ax, ay, az) || 1;
      ax /= axisLength;
      ay /= axisLength;
      az /= axisLength;

      const leftAlong = frame.lx * ax + frame.ly * ay + frame.lz * az;
      const useUp = Math.abs(leftAlong) > 0.9;
      const along = useUp ? frame.ux * ax + frame.uy * ay + frame.uz * az : leftAlong;
      let px = (useUp ? frame.ux : frame.lx) - ax * along;
      let py = (useUp ? frame.uy : frame.ly) - ay * along;
      let pz = (useUp ? frame.uz : frame.lz) - az * along;
      const sideLength = Math.hypot(px, py, pz) || 1;
      px /= sideLength;
      py /= sideLength;
      pz /= sideLength;
      const qx = ay * pz - az * py;
      const qy = az * px - ax * pz;
      const qz = ax * py - ay * px;

      spec.ax = ax;
      spec.ay = ay;
      spec.az = az;
      spec.phase = rng();
      spec.droop = 0;
      spec.flutter = profile.flutter;
      const start = rng() * Math.PI * 2;
      const vary = () => 1 + profile.scatter * (rng() * 2 - 1);

      profile.whorls.forEach((whorl, index) => {
        spec.organ = whorl.stamen ? STAMEN_ORGAN : PETAL_ORGAN;
        spec.rows = rows[index];
        spec.fold = whorl.fold;
        spec.curl = whorl.curlDeg * DEG_TO_RAD;
        spec.outline = whorl.outline;
        for (let petal = 0; petal < whorl.count; petal++) {
          const angle = start + (Math.PI * (index + 2 * petal)) / whorl.count;
          const splay = whorl.splayDeg * DEG_TO_RAD * vary();
          const radialX = px * Math.cos(angle) + qx * Math.sin(angle);
          const radialY = py * Math.cos(angle) + qy * Math.sin(angle);
          const radialZ = pz * Math.cos(angle) + qz * Math.sin(angle);
          spec.sx = ay * radialZ - az * radialY;
          spec.sy = az * radialX - ax * radialZ;
          spec.sz = ax * radialY - ay * radialX;
          spec.dx = ax * Math.cos(splay) + radialX * Math.sin(splay);
          spec.dy = ay * Math.cos(splay) + radialY * Math.sin(splay);
          spec.dz = az * Math.cos(splay) + radialZ * Math.sin(splay);
          spec.rx = radialX * whorl.inset * size;
          spec.ry = radialY * whorl.inset * size;
          spec.rz = radialZ * whorl.inset * size;
          spec.length = size * whorl.length * vary();
          spec.halfWidth = spec.length * whorl.aspect * 0.5 * widen;
          writer.blade(spec);
        }
      });

      if (!hasHeart) return;
      const seat = profile.dome > 1 ? profile.core * size * profile.dome * 0.9 : 0;
      spec.organ = HEART_ORGAN;
      spec.radius = profile.core * size;
      spec.squash = profile.dome;
      spec.cx = spec.ox + ax * seat;
      spec.cy = spec.oy + ay * seat;
      spec.cz = spec.oz + az * seat;
      [spec.nx, spec.ny, spec.nz] = [ax, ay, az];
      spec.segments = segments;
      spec.rings = rings;
      spec.sway = profile.flutter * HINGE_SHARE;
      writeOrb(writer, spec);
    },
  };
}

export function planOrgans(shape: OrganShape, detail: number): OrganPlan {
  return shape === 'berry' ? planBerries() : planFlowers(FLOWER_PROFILES[shape], detail);
}
