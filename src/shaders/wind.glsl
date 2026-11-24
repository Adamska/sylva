uniform float uWindTime;
uniform float uWindStrength;
uniform float uTurbulence;
uniform vec2 uWindDirection;
uniform float uSpecimenHeight;
uniform float uGrowth;

vec3 windOffset(vec3 point, float flex) {
  float heightRatio = clamp(point.y / uSpecimenHeight, 0.0, 1.0);
  float front = dot(point.xz, uWindDirection);
  vec3 downwind = vec3(uWindDirection.x, 0.0, uWindDirection.y);

  float gust = 0.6 + 0.4 * sin(uWindTime * 0.31 - front * 0.4);
  float swell = sin(uWindTime * 0.9 - front * 0.55) + 0.45 * sin(uWindTime * 2.1 - front * 1.3 + 1.7);
  vec3 trunk = downwind * (0.5 * gust + 0.35 * swell) * heightRatio * heightRatio * uSpecimenHeight * 0.035;

  vec3 cell = point * 1.15;
  vec3 eddies = vec3(
    sin(uWindTime * 1.7 + cell.y * 1.1 + cell.z * 0.7) + 0.5 * sin(uWindTime * 3.3 + cell.x * 2.3 + cell.y * 1.9),
    0.4 * sin(uWindTime * 2.3 + cell.x * 1.3 + cell.z * 1.1),
    cos(uWindTime * 1.4 + cell.y * 0.9 + cell.x * 0.8) + 0.5 * cos(uWindTime * 3.9 + cell.z * 2.6 + cell.y * 1.4)
  );
  vec3 limb = eddies * uTurbulence + downwind * (1.4 * gust + 0.8 * swell) - vec3(0.0, 0.25 * gust, 0.0);

  return (trunk + limb * flex * flex * 0.11) * uWindStrength;
}
