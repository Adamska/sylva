attribute vec3 aSeed;

uniform float uTime;
uniform float uScale;
uniform float uRise;

varying vec3 vWorldPosition;
varying float vTwinkle;

const float COLUMN_HEIGHT = 6.4;

void main() {
  vec3 drifted = position;
  drifted.y = mod(position.y + uTime * uRise * (0.4 + aSeed.x), COLUMN_HEIGHT) - 0.5;
  drifted.x += sin(uTime * 0.21 + aSeed.y * 40.0) * 0.4;
  drifted.z += cos(uTime * 0.17 + aSeed.z * 40.0) * 0.4;

  vec4 viewPosition = viewMatrix * vec4(drifted, 1.0);
  float edge = smoothstep(-0.5, 0.2, drifted.y) * (1.0 - smoothstep(COLUMN_HEIGHT - 1.6, COLUMN_HEIGHT - 0.5, drifted.y));

  vWorldPosition = drifted;
  vTwinkle = (0.55 + 0.45 * sin(uTime * (0.8 + aSeed.y * 2.0) + aSeed.z * 30.0)) * edge;

  gl_PointSize = uScale * (0.45 + aSeed.x) / max(0.5, -viewPosition.z);
  gl_Position = projectionMatrix * viewPosition;
}
