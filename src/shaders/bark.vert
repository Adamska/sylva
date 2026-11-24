attribute float aBranchFactor;
attribute float aBarkRoughness;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vBranchFactor;
varying float vBarkRoughness;

void main() {
  vec3 swayed = position + windOffset(position, aBranchFactor);
  vec4 world = modelMatrix * vec4(swayed, 1.0);

  vWorldPosition = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  vBranchFactor = aBranchFactor;
  vBarkRoughness = aBarkRoughness;

  gl_Position = projectionMatrix * viewMatrix * world;
}
