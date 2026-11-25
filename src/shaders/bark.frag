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
varying float vRule;
varying float vRadius;

const float TAU = 6.28318530718;
const float SLAB_FREQUENCY = 13.0;
const float CHIP_FREQUENCY = 36.0;
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

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

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.103, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

vec2 plateCells(vec3 p) {
  vec3 base = floor(p);
  vec3 local = fract(p);
  float nearest = 8.0;
  float second = 8.0;
  float tone = 0.5;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      for (int z = -1; z <= 1; z++) {
        vec3 offset = vec3(float(x), float(y), float(z));
        vec3 jitter = hash33(base + offset);
        vec3 delta = offset + jitter - local;
        float distance = dot(delta, delta);
        if (distance < nearest) {
          second = nearest;
          nearest = distance;
          tone = fract(jitter.x * 7.31 + jitter.y);
        } else if (distance < second) {
          second = distance;
        }
      }
    }
  }
  return vec2(sqrt(second) - sqrt(nearest), tone);
}

float resolved(float pixel, float frequency) {
  return 1.0 - smoothstep(0.28, 0.85, pixel * frequency);
}

float fibres(vec3 p) {
  return 1.0 - abs(2.0 * valueNoise(p) - 1.0);
}

vec4 barkLayers(vec3 site, float pixel) {
  float mottle = valueNoise(site * 6.0 + 7.3);
  float fibre = 0.6 * fibres(vec3(site.xy * 64.0, site.z * 17.0) + 3.1) + 0.4 * fibres(vec3(site.xy * 170.0, site.z * 40.0));
  fibre = mix(0.62, fibre, resolved(pixel, 80.0));

  float sway = valueNoise(site * vec3(11.0, 11.0, 4.0) + 41.3);
  vec3 drift = site + vec3(sway - 0.5, mottle - 0.5, sway - mottle) * vec3(0.05, 0.05, 0.1) + (fibre - 0.62) * vec3(0.014, 0.014, 0.03);
  vec2 slab = plateCells(vec3(drift.xy * SLAB_FREQUENCY, drift.z * SLAB_FREQUENCY * 0.22));
  vec2 chip = plateCells(vec3(drift.xy * CHIP_FREQUENCY, drift.z * CHIP_FREQUENCY * 0.42) + 19.7);
  float slabs = resolved(pixel, SLAB_FREQUENCY);
  float chips = resolved(pixel, CHIP_FREQUENCY);

  float furrow = mix(0.82, smoothstep(0.0, mix(0.1, 0.3, mottle), slab.x), slabs);
  float flake = mix(0.9, smoothstep(0.0, 0.09, chip.x), chips);
  float tone = mix(0.5, 0.6 * slab.y + 0.4 * chip.y, slabs);
  float height = furrow * (0.46 + 0.2 * slab.y + 0.12 * chip.y * chips) * mix(0.72, 1.0, flake) + 0.24 * fibre * furrow;
  return vec4(height, tone, fibre, mottle);
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
  float angle = vUv.x * TAU;
  float girth = max(vRadius, 0.018);
  vec3 site = vec3(cos(angle) * girth, sin(angle) * girth, vUv.y);
  float pixel = max(length(dFdx(site)), length(dFdy(site)));
  vec4 layers = barkLayers(site, pixel);
  float height = layers.x;
  float tone = layers.y;
  float fibre = layers.z;
  float mottle = layers.w;
  float raised = smoothstep(0.12, 0.62, height);

  float green = smoothstep(0.01, 0.07, uBarkLight.g - max(uBarkLight.r, uBarkLight.b));
  float age = smoothstep(0.1, 0.7, vBarkRoughness) * (1.0 - green);
  vec3 geometricNormal = normalize(vWorldNormal);
  vec3 normal = bumpNormal(geometricNormal, vWorldPosition, height, uBarkRelief * mix(0.001, 0.009, age));
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);

  vec3 youngWood = mix(uBarkLight, uBarkDark, 0.35) * (0.84 + 0.26 * fibre);
  vec3 ridge = mix(uBarkDark, uBarkLight, 0.1 + 0.42 * tone + 0.28 * fibre + 0.2 * mottle);
  float weathering = smoothstep(0.5, 0.82, mottle) * raised;
  ridge = mix(ridge, vec3(dot(ridge, LUMA)) * 1.2 + uBarkLight * 0.1, 0.4 * weathering);
  vec3 oldWood = mix(mix(uBarkDark, ridge, 0.3) * 0.82, ridge, raised);
  vec3 albedo = mix(youngWood, oldWood, age);
  float cavity = mix(1.0, mix(0.64, 1.0, smoothstep(0.05, 0.45, height)), age);
  float grounding = mix(0.55, 1.0, smoothstep(0.0, 0.6, vWorldPosition.y));

  float sun = getShadowMask();
  vec3 light = hemisphereLight(normal);
  light += uKeyColor * wrappedDiffuse(normal, uKeyDirection, 0.2) * sun;
  light += uBackColor * wrappedDiffuse(normal, uBackDirection, 0.1);
  vec3 color = albedo * light * cavity * grounding;

  vec3 halfVector = normalize(uKeyDirection + viewDirection);
  float sheen = pow(max(dot(normal, halfVector), 0.0), mix(20.0, 7.0, age)) * mix(0.1, 0.018, age);
  color += uKeyColor * sheen * cavity * DIFFUSE_SCALE * sun;

  float rim = fresnelTerm(normal, viewDirection, 3.0);
  float backFacing = wrappedDiffuse(geometricNormal, uBackDirection, 0.6) / DIFFUSE_SCALE;
  color += uRimColor * rim * (0.2 + 0.8 * backFacing) * mix(0.3, 0.14, age) * cavity;

  float sapPulse = smoothstep(0.6, 1.0, sin(vUv.y * 3.2 - uTime * 1.5) * 0.5 + 0.5);
  float sapVeins = mix(smoothstep(0.6, 0.3, mottle), 1.0 - raised, age);
  float sap = sapVeins * (0.5 + 2.4 * sapPulse) + rim * 0.6;
  color += uGlowColor * uGlow * sap * mix(0.35, 1.0, vBranchFactor);

  gl_FragColor = vec4(highlightRule(color, vRule), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
