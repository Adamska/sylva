uniform vec3 uKeyDirection;
uniform vec3 uKeyColor;
uniform vec3 uBackDirection;
uniform vec3 uBackColor;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;
uniform vec3 uRimColor;

const float DIFFUSE_SCALE = 0.31830989;

vec3 hemisphereLight(vec3 normal) {
  return mix(uGroundColor, uSkyColor, normal.y * 0.5 + 0.5);
}

float wrappedDiffuse(vec3 normal, vec3 lightDirection, float wrap) {
  return DIFFUSE_SCALE * max((dot(normal, lightDirection) + wrap) / (1.0 + wrap), 0.0);
}

float fresnelTerm(vec3 normal, vec3 viewDirection, float power) {
  return pow(1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0), power);
}
