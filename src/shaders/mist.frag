uniform vec3 uMistColor;
uniform float uTime;
uniform float uHaze;

varying vec2 vPlane;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), f.x),
    mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  float radius = length(vPlane);
  vec2 flow = vPlane * 0.32 + vec2(uTime * 0.035, -uTime * 0.02);
  float billow = valueNoise(flow) * 0.6 + valueNoise(flow * 2.3 + 7.1) * 0.3 + valueNoise(flow * 5.1 - 3.7) * 0.1;
  float band = smoothstep(1.6, 3.4, radius) * (1.0 - smoothstep(5.5, 10.5, radius));
  float density = smoothstep(0.3, 0.85, billow) * band;

  gl_FragColor = vec4(uMistColor * density * uHaze * 0.16, 1.0);
}
