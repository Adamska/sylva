uniform float uWindTime;
uniform float uWindStrength;
uniform float uTurbulence;
uniform vec2 uWindDirection;
uniform float uSpecimenHeight;
uniform float uTrunkRadius;
uniform float uGrowth;

float windHash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

float windNoise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec2 blend = local * local * (3.0 - 2.0 * local);
  return mix(
    mix(windHash(cell), windHash(cell + vec2(1.0, 0.0)), blend.x),
    mix(windHash(cell + vec2(0.0, 1.0)), windHash(cell + vec2(1.0, 1.0)), blend.x),
    blend.y
  );
}

float windGust(vec3 site) {
  vec2 front = vec2(dot(site.xz, uWindDirection), dot(site.xz, vec2(-uWindDirection.y, uWindDirection.x)));
  float broad = windNoise(vec2(front.x * 0.16 - uWindTime * 0.22, front.y * 0.1 + 3.7));
  float ripple = windNoise(vec2(front.x * 0.55 - uWindTime * 0.75, front.y * 0.35 + site.y * 0.25 - uWindTime * 0.1));
  return 0.1 + 0.85 * smoothstep(0.15, 0.9, broad) + 0.5 * ripple;
}

vec3 windOffset(vec3 point, float flex) {
  vec3 site = (modelMatrix * vec4(point, 1.0)).xyz;
  vec3 downwind = vec3(uWindDirection.x, 0.0, uWindDirection.y);
  float gust = windGust(site);

  float heightRatio = clamp(point.y / uSpecimenHeight, 0.0, 1.0);
  float slenderness = clamp(uSpecimenHeight / (uTrunkRadius * 45.0), 0.35, 4.0);
  float creak = sin(uWindTime * 1.1 - dot(site.xz, uWindDirection) * 0.2);
  vec3 trunk = downwind * (0.6 * gust + 0.25 * creak) * heightRatio * heightRatio * uSpecimenHeight * slenderness * 0.006;

  float limber = smoothstep(0.1, 1.0, flex);
  float reach = limber * limber * limber;
  vec3 cell = site * 1.15;
  vec3 eddies = vec3(
    sin(uWindTime * 1.7 + cell.y * 1.1 + cell.z * 0.7) + 0.5 * sin(uWindTime * 3.3 + cell.x * 2.3 + cell.y * 1.9),
    0.7 * sin(uWindTime * 2.3 + cell.x * 1.3 + cell.z * 1.1),
    cos(uWindTime * 1.4 + cell.y * 0.9 + cell.x * 0.8) + 0.5 * cos(uWindTime * 3.9 + cell.z * 2.6 + cell.y * 1.4)
  );
  vec3 shiver = vec3(
    sin(uWindTime * 6.1 + cell.x * 4.1 + cell.y * 3.3),
    sin(uWindTime * 5.3 + cell.z * 3.7 + cell.x * 2.9),
    cos(uWindTime * 7.3 + cell.y * 4.3 + cell.z * 3.1)
  );
  vec3 limb = downwind * (1.5 * gust - 0.25) + (eddies * (0.35 + 0.65 * gust) + shiver * gust * reach * 0.5) * uTurbulence;
  limb *= reach * 0.075 * uWindStrength;
  limb.y -= dot(limb.xz, limb.xz) * 1.6 / uSpecimenHeight;

  return trunk * uWindStrength + limb;
}
