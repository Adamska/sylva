attribute float aBranchFactor;
attribute float aBarkRoughness;

uniform float uTrunkRadius;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vBranchFactor;
varying float vBarkRoughness;

void main() {
  float reveal = smoothstep(0.0, 0.12, uGrowth * 1.12 - aBranchFactor);
  float radius = aBarkRoughness * aBarkRoughness * uTrunkRadius;
  vec3 grown = position - normal * radius * (1.0 - reveal);
  vec3 swayed = grown + windOffset(grown, aBranchFactor);
  vec4 world = modelMatrix * vec4(swayed, 1.0);

  vWorldPosition = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  vBranchFactor = aBranchFactor;
  vBarkRoughness = aBarkRoughness;

  gl_Position = projectionMatrix * viewMatrix * world;
}
