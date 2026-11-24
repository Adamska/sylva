attribute vec3 aAnchor;
attribute float aSway;
attribute float aPhase;
attribute float aBranchFactor;
attribute float aShade;

uniform float uFlutter;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vShade;
varying float vPhase;

void main() {
  vec3 carried = windOffset(aAnchor, aBranchFactor);

  float beat = uWindTime * (4.5 + 3.0 * aPhase) + aPhase * 6.28318530718;
  float flap = 0.6 * sin(beat + position.y * 2.0) + 0.4 * sin(beat * 1.73 + position.x * 3.1);
  float twist = cos(beat * 0.8 + position.z * 2.4);
  vec3 blade = position - aAnchor;
  vec3 lateral = normalize(cross(normal, blade) + vec3(1e-5));
  vec3 downwind = vec3(uWindDirection.x, -0.35, uWindDirection.y);

  float amplitude = aSway * uFlutter * uWindStrength;
  vec3 flutter = (normal * flap + lateral * twist * 0.5) * amplitude * 0.24 + downwind * amplitude * 0.18;
  vec3 swayed = position + carried + flutter;
  vec4 world = modelMatrix * vec4(swayed, 1.0);

  vec3 tilted = normalize(normal + lateral * flap * min(1.0, amplitude * 4.0) * 0.45);

  vWorldPosition = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * tilted);
  vUv = uv;
  vShade = aShade;
  vPhase = aPhase;

  gl_Position = projectionMatrix * viewMatrix * world;
}
