uniform vec3 uBase;
uniform vec3 uHalo;
uniform float uAspect;

varying vec2 vScreen;

float grain(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 point = vec2(vScreen.x * uAspect, vScreen.y);
  vec2 offset = point - vec2(0.0, 0.08);
  float halo = exp(-dot(offset, offset) * 1.35);
  float horizon = exp(-pow((vScreen.y + 0.42) * 3.2, 2.0));
  float vignette = smoothstep(1.9, 0.35, length(point));

  vec3 color = uBase + uHalo * (halo * 0.5 + horizon * 0.12);
  color *= mix(0.55, 1.0, vignette);
  color += (grain(gl_FragCoord.xy) - 0.5) * 0.006;

  gl_FragColor = vec4(max(color, 0.0), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
