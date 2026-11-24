#include <common>
#include <packing>

uniform bool receiveShadow;

#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uKeyDirection;
uniform vec3 uKeyColor;
uniform vec3 uBackDirection;
uniform vec3 uBackColor;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;
uniform vec3 uRimColor;
uniform float uHighlightRule;
uniform float uHighlight;

const float DIFFUSE_SCALE = 0.31830989;
const vec3 HIGHLIGHT_TINT = vec3(0.85, 0.6, 0.26);

vec3 hemisphereLight(vec3 normal) {
  return mix(uGroundColor, uSkyColor, normal.y * 0.5 + 0.5);
}

float wrappedDiffuse(vec3 normal, vec3 lightDirection, float wrap) {
  return DIFFUSE_SCALE * max((dot(normal, lightDirection) + wrap) / (1.0 + wrap), 0.0);
}

float fresnelTerm(vec3 normal, vec3 viewDirection, float power) {
  return pow(1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0), power);
}

vec3 highlightRule(vec3 color, float rule) {
  float hit = 1.0 - smoothstep(0.3, 0.7, abs(rule - uHighlightRule));
  vec3 lifted = color * 1.2 + HIGHLIGHT_TINT * 0.4;
  return mix(color, mix(color * 0.12, lifted, hit), uHighlight);
}
