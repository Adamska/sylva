uniform vec3 uLeafDeep;
uniform vec3 uLeafBright;
uniform vec3 uSubsurface;
uniform float uTranslucency;
uniform float uGlow;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vShade;
varying float vPhase;

float transmittedLight(vec3 normal, vec3 viewDirection, vec3 lightDirection) {
  float lit = clamp(dot(-normal, lightDirection) * 0.85 + 0.15, 0.0, 1.0);
  vec3 scattered = normalize(lightDirection + normal * 0.32);
  float forward = pow(clamp(dot(viewDirection, -scattered), 0.0, 1.0), 4.0);
  return DIFFUSE_SCALE * lit * (0.35 + 2.4 * forward);
}

void main() {
  vec3 normal = normalize(vWorldNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);

  float across = abs(vUv.x - 0.5) * 2.0;
  float midrib = 1.0 - smoothstep(0.0, 0.1, across);
  float branching = abs(fract(vUv.y * 6.0 - across * 1.4) - 0.5) * 2.0;
  float sideVeins = (1.0 - smoothstep(0.0, 0.16, branching)) * (1.0 - across * 0.7);
  float veins = clamp(max(midrib, sideVeins * 0.7) * smoothstep(1.0, 0.75, vUv.y), 0.0, 1.0);
  float margin = smoothstep(0.55, 1.0, across);

  float tone = clamp(vUv.y * 0.55 + (vPhase - 0.5) * 0.5 + 0.2, 0.0, 1.0);
  vec3 albedo = mix(uLeafDeep, uLeafBright, tone);
  albedo = mix(albedo, uLeafBright, veins * 0.3);

  vec3 light = hemisphereLight(normal);
  light += uKeyColor * wrappedDiffuse(normal, uKeyDirection, 0.35);
  light += uBackColor * wrappedDiffuse(normal, uBackDirection, 0.2);
  vec3 color = albedo * light * vShade;

  float thinness = (1.0 - veins * 0.7) * mix(0.8, 1.15, margin);
  vec3 through = uKeyColor * transmittedLight(normal, viewDirection, uKeyDirection);
  through += uBackColor * transmittedLight(normal, viewDirection, uBackDirection);
  vec3 scatterTint = mix(albedo, uSubsurface, 0.5);
  color += scatterTint * through * thinness * uTranslucency * mix(0.55, 1.0, vShade);

  vec3 halfVector = normalize(uKeyDirection + viewDirection);
  float gloss = pow(max(dot(normal, halfVector), 0.0), 42.0);
  color += uKeyColor * gloss * 0.12 * vShade;
  color += uRimColor * fresnelTerm(normal, viewDirection, 4.0) * 0.05;

  float breath = 0.5 + 0.5 * sin(uTime * 1.3 + vPhase * 6.28318530718);
  float core = 1.0 - smoothstep(0.0, 0.95, across);
  vec3 lumen = mix(uLeafBright, uSubsurface, smoothstep(0.35, 1.0, across) * 0.85);
  color = mix(color, color * 0.3, uGlow);
  color += lumen * lumen * uGlow * (0.7 + 1.1 * breath) * (0.45 + 0.55 * core);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
