#include <common>
#include <shadowmap_pars_vertex>

attribute float aBranchFactor;
attribute float aBarkRoughness;
attribute float aRule;

uniform float uTrunkRadius;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vBranchFactor;
varying float vBarkRoughness;
varying float vRule;

void main() {
  float reveal = smoothstep(0.0, 0.12, uGrowth * 1.12 - aBranchFactor);
  float radius = aBarkRoughness * aBarkRoughness * uTrunkRadius;
  vec3 grown = position - normal * radius * (1.0 - reveal);
  vec3 swayed = grown + windOffset(grown, aBranchFactor);
  vec4 world = modelMatrix * vec4(swayed, 1.0);
  vec3 worldNormal = normalize(mat3(modelMatrix) * normal);

  vWorldPosition = world.xyz;
  vWorldNormal = worldNormal;
  vUv = uv;
  vBranchFactor = aBranchFactor;
  vBarkRoughness = aBarkRoughness;
  vRule = aRule;

  #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
    vec4 shadowPoint = world + vec4(worldNormal * directionalLightShadows[0].shadowNormalBias, 0.0);
    vDirectionalShadowCoord[0] = directionalShadowMatrix[0] * shadowPoint;
  #endif

  gl_Position = projectionMatrix * viewMatrix * world;
}
