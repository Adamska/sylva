uniform vec3 uBarkDark;
uniform vec3 uBarkLight;
uniform vec3 uGlowColor;
uniform float uGlow;
uniform float uBarkRelief;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vBranchFactor;
varying float vBarkRoughness;

const float TAU = 6.28318530718;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

float valueNoise(vec3 p) {
  vec3 cell = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float bottom = mix(
    mix(hash13(cell), hash13(cell + vec3(1.0, 0.0, 0.0)), f.x),
    mix(hash13(cell + vec3(0.0, 1.0, 0.0)), hash13(cell + vec3(1.0, 1.0, 0.0)), f.x),
    f.y
  );
  float top = mix(
    mix(hash13(cell + vec3(0.0, 0.0, 1.0)), hash13(cell + vec3(1.0, 0.0, 1.0)), f.x),
    mix(hash13(cell + vec3(0.0, 1.0, 1.0)), hash13(cell + vec3(1.0, 1.0, 1.0)), f.x),
    f.y
  );
  return mix(bottom, top, f.z);
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 3; octave++) {
    sum += amplitude * valueNoise(p);
    p = p * 2.03 + 17.1;
    amplitude *= 0.5;
  }
  return sum / 0.875;
}

vec2 barkRelief(vec2 uv) {
  float angle = uv.x * TAU;
  vec3 around = vec3(cos(angle), sin(angle), 0.0);
  float warp = valueNoise(around * 1.3 + vec3(0.0, 0.0, uv.y * 0.7));
  float plates = 1.0 - abs(2.0 * valueNoise(around * 2.6 + vec3(0.0, 0.0, uv.y * 1.25 + warp * 1.6)) - 1.0);
  float grain = fbm(around * 8.0 + vec3(0.0, 0.0, uv.y * 4.5));
  return vec2(plates * 0.68 + grain * 0.32, plates);
}

vec3 bumpNormal(vec3 normal, vec3 position, float height, float strength) {
  vec3 dpdx = dFdx(position);
  vec3 dpdy = dFdy(position);
  vec3 r1 = cross(dpdy, normal);
  vec3 r2 = cross(normal, dpdx);
  float determinant = dot(dpdx, r1);
  vec3 gradient = sign(determinant) * (dFdx(height) * r1 + dFdy(height) * r2);
  return normalize(abs(determinant) * normal - strength * gradient);
}

void main() {
  vec2 relief = barkRelief(vUv);
  float height = relief.x;
  float age = smoothstep(0.1, 0.7, vBarkRoughness);
  vec3 geometricNormal = normalize(vWorldNormal);
  vec3 normal = bumpNormal(geometricNormal, vWorldPosition, height, uBarkRelief * mix(0.012, 0.07, age));
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);

  vec3 youngWood = mix(uBarkLight, uBarkDark, 0.35);
  vec3 oldWood = mix(uBarkDark, uBarkLight, smoothstep(0.25, 0.85, height));
  vec3 albedo = mix(youngWood, oldWood, age);
  float cavity = mix(1.0, mix(0.45, 1.0, smoothstep(0.1, 0.7, height)), age);
  float grounding = mix(0.55, 1.0, smoothstep(0.0, 0.6, vWorldPosition.y));

  vec3 light = hemisphereLight(normal);
  light += uKeyColor * wrappedDiffuse(normal, uKeyDirection, 0.2);
  light += uBackColor * wrappedDiffuse(normal, uBackDirection, 0.1);
  vec3 color = albedo * light * cavity * grounding;

  vec3 halfVector = normalize(uKeyDirection + viewDirection);
  float sheen = pow(max(dot(normal, halfVector), 0.0), 28.0) * mix(0.22, 0.06, age);
  color += uKeyColor * sheen * cavity * DIFFUSE_SCALE;

  float rim = fresnelTerm(normal, viewDirection, 3.0);
  float backFacing = wrappedDiffuse(geometricNormal, uBackDirection, 0.6) / DIFFUSE_SCALE;
  color += uRimColor * rim * (0.2 + 0.8 * backFacing) * 0.3;

  float sapPulse = smoothstep(0.6, 1.0, sin(vUv.y * 3.2 - uTime * 1.5) * 0.5 + 0.5);
  float sapVeins = smoothstep(0.35, 0.05, relief.y);
  float sap = sapVeins * (0.5 + 2.4 * sapPulse) + rim * 0.6;
  color += uGlowColor * uGlow * sap * mix(0.35, 1.0, vBranchFactor);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
